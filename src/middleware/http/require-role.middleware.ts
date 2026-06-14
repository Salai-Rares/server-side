import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { UserRole } from "@/modules/users/domain/types/user.types";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.session.userId) {
      return next(ApiError.unauthorized("Authentication required"));
    }
    if (!req.session.role || !roles.includes(req.session.role)) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
}
