import { toObjectId } from "@/shared/utils";
import { UserEntity } from "../../domain/entities/user.entity";
import { IUser } from "../../domain/types/user.types";
import { ApiError } from "@/shared/errors/api-error/ApiError";

export class UserPersistanceMapper {
  static toPersistance(
    entity: UserEntity
  ): Omit<IUser, "createdAt" | "updatedAt"> {
    if (!entity.passwordHash) {
      throw ApiError.businessRuleViolation(
        "In creation of users the password hash needs to be provided",
        "missing_password"
      );
    }
    return {
      _id: toObjectId(entity.id),
      email: entity.email.value,
      passwordHash: entity.passwordHash, // we know will be string because this will be called only on create
      firstName: entity.firstName,
      lastName: entity.lastName,
      role: entity.role,
      status: entity.status.value,
      terms:entity.terms.toPrimitives(),
      addresses: entity.addresses,
      wishlist: entity.wishlist.map((wishlist)=>toObjectId(wishlist)),
      newsletter: entity.newsletter,
      marketingConsent: entity.marketingConsent,
      phoneVerified: entity.phoneVerified,
      twoFactorEnabled: entity.twoFactorEnabled,
      phone: entity.phone,
      dateOfBirth: entity.dateOfBirth,
       failedLoginAttempts: entity.failedLoginAttempts,
      lockUntil: entity.lockUntil,
      deactivationDetails: entity.deactivationDetails,
      suspensionDetails: entity.suspensionDetails,
      lastLoginAt: entity.lastLoginAt,
      emailVerification:entity.emailVerification.toPrimitives()
    };
  }
}
