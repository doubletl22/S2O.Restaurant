import { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../utils/jwt.js";
import { HttpError } from "../utils/httpError.js";

export type AuthUser = {
  userId: string;
  role: string;
  restaurantId?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  if (!token) return next(new HttpError(401, "Missing access token"));

  try {
    const payload = verifyAccess(token);
    req.auth = {
      userId: payload.sub,
      role: payload.role,
      restaurantId: payload.restaurantId ?? null
    };
    next();
  } catch {
    next(new HttpError(401, "Invalid/expired access token"));
  }
}
