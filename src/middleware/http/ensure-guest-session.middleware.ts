// ensure-guest-session.middleware.ts

import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

export function ensureGuestSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session.userId && !req.session.guestId) {
    req.session.guestId = randomUUID();
  }

  next();
}