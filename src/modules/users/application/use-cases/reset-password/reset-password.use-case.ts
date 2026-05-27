import { injectable, inject } from "inversify";
import { IResetPasswordUseCase, ResetPasswordCommand } from "./reset-password.use-case.interface";
import { IUserRepository } from "../../ports/repositories/user.repository.interface";
import { IPasswordHasher } from "../../ports/password-hasher.port";
import { ITokenService } from "@/core/application/ports/email/email-token-service.interface";
import { PasswordPolicy } from "@/modules/users/domain/services/password-policy.service";
import { ConfirmationTokenType } from "@/core/application/ports/token/confirmation-token-kind.enum";
import { USERS_TYPES } from "@/modules/users/infrastructure/di/users.symbols";
import { TYPES } from "@/shared/types";
import { ApiError } from "@/shared/errors/api-error/ApiError";

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    @inject(USERS_TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(USERS_TYPES.PasswordHasher) private passwordHasher: IPasswordHasher,
    @inject(TYPES.ConfirmationTokenService) private tokenService: ITokenService,
    @inject(PasswordPolicy) private passwordPolicy: PasswordPolicy
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    this.passwordPolicy.validate(command.newPassword);

    const data = await this.tokenService.verifyAndConsumeToken(
      command.token,
      ConfirmationTokenType.PASSWORD_RESET
    );
    if (!data) throw ApiError.badRequest("Invalid or expired reset token");

    const user = await this.userRepository.findByEmail(data.subject);
    if (!user) throw ApiError.notFound("User not found");

    const newHash = await this.passwordHasher.hash(command.newPassword);
    user.changePassword(newHash);
    await this.userRepository.updatePassword(user);
  }
}
