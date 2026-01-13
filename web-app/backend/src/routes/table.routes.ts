import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRestaurantScope, requireRole } from "../middlewares/rbac.js";
import { validateBody } from "../middlewares/validate.js";

const r = Router();

r.use(requireAuth, requireRestaurantScope, requireRole(["OWNER", "MANAGER", "STAFF"]));

// tạo bàn theo branch
r.post(
  "/",
  validateBody(z.object({ branchId: z.string(), code: z.string().min(1), name: z.string().optional() })),
  async (req, res) => {
    const t = await prisma.table.create({
      data: { branchId: req.body.branchId, code: req.body.code, name: req.body.name }
    });
    res.json(t);
  }
);

// list bàn theo branch
r.get("/by-branch/:branchId", async (req, res) => {
  const tables = await prisma.table.findMany({ where: { branchId: req.params.branchId } });
  res.json(tables);
});

// tạo QR link (frontend sẽ render QR)
r.get("/qr-link", async (req, res) => {
  const { restaurantSlug, branchId, tableCode } = req.query as any;
  const link = `http://localhost:3000/guest/${restaurantSlug}/${branchId}/${tableCode}`;
  res.json({ link });
});

export default r;
