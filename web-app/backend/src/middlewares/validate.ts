import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { HttpError } from "../utils/httpError.js";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new HttpError(400, parsed.error.issues.map(i => i.message).join("; ")));
    }
    req.body = parsed.data;
    next();
  };
}
