import { inject, injectable } from "inversify";
import { IVerifyEmailUseCase } from "./verify-email.use-case.interface";
import { ITokenService } from "@/core/application/ports/email/email-token-service.interface";
import { IUserRepository } from "../../ports/repositories/user.repository.interface";
import { TYPES } from "@/shared/types";
import { USERS_TYPES } from "@/modules/users/infrastructure/di/users.symbols";
import { ConfirmationTokenType } from "@/core/application/ports/token/confirmation-token-kind.enum";
import { ApiError } from "@/shared/errors/api-error/ApiError";

@injectable()
export class VerifyEmailUseCase implements IVerifyEmailUseCase {
  constructor(
    @inject(TYPES.ConfirmationTokenService) private tokenService: ITokenService,
    @inject(USERS_TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(token: string): Promise<void> {
    const data = await this.tokenService.verifyAndConsumeToken(token, ConfirmationTokenType.EMAIL_VERIFICATION);
    if (!data) throw ApiError.notFound("Invalid or expired verification token");

    const user = await this.userRepository.findByEmail(data.subject);
    if (!user) throw ApiError.notFound("User not found");

    if (user.emailVerification.isVerified()) return;

    user.markEmailVerified();
    await this.userRepository.updateEmailVerification(user.id, user.emailVerification);
  }
}
