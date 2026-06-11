import "express-session";
import { UserRole } from "@/modules/users/domain/types/user.types";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: UserRole;
    guestId?: string;
  }
}