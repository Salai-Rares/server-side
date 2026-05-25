import { ClientSession } from "mongoose";
import { IUserRepository } from "../../application/ports/repositories/user.repository.interface";
import { UserEntity } from "../../domain/entities/user.entity";
import { injectable } from "inversify";
import { UserPersistanceMapper } from "../mappers/entity-to-db.mapper";
import { UserDbToEntityMapper } from "../mappers/db-to-entity.mapper";
import UserModel from "../models/user.model";
import { EmailVerificationVO } from "../../domain/entities/value-objects/email-verification.value-object";
import { toObjectId } from "@/shared/utils";

@injectable()
export class UserRepository implements IUserRepository {
  async saveUser(user: UserEntity, options?: { session?: ClientSession }): Promise<void> {
    const toBePersistedDto = UserPersistanceMapper.toPersistance(user);
    await UserModel.create([toBePersistedDto], { session: options?.session });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    if (!doc) return null;
    return UserDbToEntityMapper.toDomain(doc);
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!doc) return null;
    return UserDbToEntityMapper.toDomain(doc);
  }

  async updateLoginStatus(user: UserEntity): Promise<void> {
    await UserModel.updateOne(
      { _id: toObjectId(user.id) },
      {
        $set: {
          failedLoginAttempts: user.failedLoginAttempts ?? 0,
          lockUntil: user.lockUntil ?? null,
          lastLoginAt: user.lastLoginAt ?? null,
          updatedAt: user.updatedAt,
        },
      }
    );
  }

  async updateEmailVerification(userId: string, emailVerification: EmailVerificationVO): Promise<void> {
    await UserModel.updateOne(
      { _id: toObjectId(userId) },
      { $set: { emailVerification: emailVerification.toPrimitives(), updatedAt: new Date() } }
    );
  }
}