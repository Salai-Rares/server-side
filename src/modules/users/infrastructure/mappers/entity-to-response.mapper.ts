import { UserEntity } from "../../domain/entities/user.entity";

export class UserEntityToResponseMapper {
  static toDto(entity: UserEntity): Record<string, any> {
    return {
      id: entity.id,
      email: entity.emailAddress,
      firstName: entity.firstName,
      lastName: entity.lastName,
      fullName: entity.fullName,
      role: entity.role,
      emailVerification: {
        status: entity.emailVerification.status,
        verifiedAt: entity.emailVerification.verifiedAt ?? null,
      },
      newsletter: entity.newsletter ?? null,
      marketingConsent: entity.marketingConsent ?? null,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
