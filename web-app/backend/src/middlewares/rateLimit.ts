// Khung để bạn nâng cấp: dùng Redis INCR + EXPIRE cho login/guest order
import { Request, Response, NextFunction } from "express";
export function simpleRateLimit(_keyPrefix: string, _limit: number, _windowSec: number) {
  return (_req: Request, _res: Response, next: NextFunction) => next();
}
