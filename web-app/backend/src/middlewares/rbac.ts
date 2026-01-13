import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError.js";

export function requireRole(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.auth?.role;
    if (!role) return next(new HttpError(401, "Unauthenticated"));
    if (!roles.includes(role)) return next(new HttpError(403, "Forbidden"));
    next();
  };
}

// Với các API thuộc nhà hàng: bắt buộc có restaurantId (trừ ADMIN)
export function requireRestaurantScope(req: Request, _res: Response, next: NextFunction) {
  const role = req.auth?.role;
  if (role === "ADMIN") return next();
  if (!req.auth?.restaurantId) return next(new HttpError(403, "Missing restaurant scope"));
  next();
}
