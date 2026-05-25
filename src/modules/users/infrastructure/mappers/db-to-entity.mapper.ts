import { IUserDocument } from "../../domain/types/user.types";
import { UserEntity } from "../../domain/entities/user.entity";
import { EmailVO } from "../../domain/entities/value-objects/email.value-object";
import { UserStatusVO } from "../../domain/entities/value-objects/user-status.value-object";
import { EmailVerificationVO } from "../../domain/entities/value-objects/email-verification.value-object";
import { TermsAcceptanceVO } from "../../domain/entities/value-objects/terms-acceptance.value-objects";
import { Types } from "mongoose";

export class UserDbToEntityMapper {
  static toDomain(doc: IUserDocument & { _id: Types.ObjectId }): UserEntity {
    return UserEntity.fromPersistence({
      id: doc._id.toString(),
      email: EmailVO.create(doc.email),
      passwordHash: doc.passwordHash ?? null,
      firstName: doc.firstName,
      lastName: doc.lastName,
      role: doc.role,
      status: new UserStatusVO(doc.status),
      terms: TermsAcceptanceVO.fromPersistence(doc.terms),
      emailVerification: EmailVerificationVO.fromPersistence(doc.emailVerification),
      addresses: doc.addresses,
      wishlist: doc.wishlist?.map((id) => id.toString()) ?? [],
      newsletter: doc.newsletter,
      marketingConsent: doc.marketingConsent,
      phoneVerified: doc.phoneVerified,
      twoFactorEnabled: doc.twoFactorEnabled,
      phone: doc.phone,
      dateOfBirth: doc.dateOfBirth,
      failedLoginAttempts: doc.failedLoginAttempts,
      lockUntil: doc.lockUntil,
      deactivationDetails: doc.deactivationDetails,
      suspensionDetails: doc.suspensionDetails,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      lastLoginAt: doc.lastLoginAt,
    });
  }
}
