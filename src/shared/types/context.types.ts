import { UserRole } from "@/modules/users/domain/types/user.types";

export interface CallerContext {
  userId: string;
  role: UserRole;
}
