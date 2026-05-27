import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { EmailVerificationVO } from "@/modules/users/domain/entities/value-objects/email-verification.value-object";
import { ClientSession } from "mongoose";

export interface IUserRepository {
  saveUser(user: UserEntity, options?: { session?: ClientSession }): Promise<void>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByEmailWithPassword(email: string): Promise<UserEntity | null>;
  updateEmailVerification(userId: string, emailVerification: EmailVerificationVO): Promise<void>;
  updateLoginStatus(user: UserEntity): Promise<void>;
  updatePassword(user: UserEntity): Promise<void>;
}
