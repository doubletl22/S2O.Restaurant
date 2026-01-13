import jwt from "jsonwebtoken";
import { CONFIG } from "../config.js";

export type JwtPayload = {
  sub: string;
  role: string;
  restaurantId?: string | null;
};

export function signAccess(payload: JwtPayload) {
  return jwt.sign(payload, CONFIG.JWT_ACCESS_SECRET, { expiresIn: CONFIG.ACCESS_TTL });
}

export function signRefresh(payload: JwtPayload) {
  return jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET, { expiresIn: CONFIG.REFRESH_TTL });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, CONFIG.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, CONFIG.JWT_REFRESH_SECRET) as JwtPayload;
}
