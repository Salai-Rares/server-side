import { injectable, inject } from "inversify";
import { IUserLoginUseCase } from "./user-login.use-case.interface";
import { LoginCommand } from "../../dtos/auth/login.dto";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { USERS_TYPES } from "@/modules/users/infrastructure/di/users.symbols";
import { IPasswordHasher } from "../../ports/password-hasher.port";
import { IUserRepository } from "../../ports/repositories/user.repository.interface";
import { ApiError } from "@/shared/errors/api-error/ApiError";

@injectable()
export class UserLoginUseCase implements IUserLoginUseCase {
  constructor(
    @inject(USERS_TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(USERS_TYPES.PasswordHasher) private passwordHasher: IPasswordHasher
  ) {}

  async execute(command: LoginCommand): Promise<UserEntity> {
    const user = await this.userRepository.findByEmailWithPassword(command.email);

    if (!user) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    if (user.isLocked()) {
      throw ApiError.forbidden("Account temporarily locked. Try again later.");
    }

    const passwordMatch = await this.passwordHasher.compare(
      command.password,
      user.passwordHash!
    );

    if (!passwordMatch) {
      user.recordFailedLogin();
      await this.userRepository.updateLoginStatus(user);
      throw ApiError.unauthorized("Invalid credentials");
    }

    user.recordSuccessfulLogin();
    await this.userRepository.updateLoginStatus(user);

    return user;
  }
}
