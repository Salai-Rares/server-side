import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/shared/errors/api-error/ApiError";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    return next(ApiError.unauthorized("Authentication required"));
  }
  next();
}
