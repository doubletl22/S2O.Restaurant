import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { validateBody } from "../middlewares/validate.js";
import { HttpError } from "../utils/httpError.js";
import { verifyPassword, hashToken, verifyTokenHash } from "../utils/hash.js";
import { signAccess, signRefresh, verifyRefresh } from "../utils/jwt.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

r.post("/login", validateBody(LoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const payload = { sub: user.id, role: user.role, restaurantId: user.restaurantId };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    const tokenHash = await hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 1000 * Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 1209600));

    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt }
    });

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, restaurantId: user.restaurantId }
    });
  } catch (e) {
    next(e);
  }
});

const RefreshSchema = z.object({ refreshToken: z.string().min(10) });

r.post("/refresh", validateBody(RefreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const payload = verifyRefresh(refreshToken);

    const tokens = await prisma.refreshToken.findMany({
      where: { userId: payload.sub, revokedAt: null }
    });

    // kiểm tra token match (so hash)
    let matchedId: string | null = null;
    for (const t of tokens) {
      const ok = await verifyTokenHash(refreshToken, t.tokenHash);
      if (ok) {
        matchedId = t.id;
        // hết hạn
        if (t.expiresAt.getTime() < Date.now()) throw new HttpError(401, "Refresh token expired");
        break;
      }
    }
    if (!matchedId) throw new HttpError(401, "Refresh token invalid");

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new HttpError(401, "User not found");

    const newPayload = { sub: user.id, role: user.role, restaurantId: user.restaurantId };
    const newAccess = signAccess(newPayload);
    const newRefresh = signRefresh(newPayload);

    // revoke old, create new (rotation)
    await prisma.refreshToken.update({ where: { id: matchedId }, data: { revokedAt: new Date() } });
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await hashToken(newRefresh),
        expiresAt: new Date(Date.now() + 1000 * Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 1209600))
      }
    });

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (e) {
    next(e);
  }
});

r.post("/logout", requireAuth, async (req, res, next) => {
  try {
    // logout toàn bộ sessions user
    await prisma.refreshToken.updateMany({
      where: { userId: req.auth!.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default r;
