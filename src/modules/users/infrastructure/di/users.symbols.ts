import { UserRepository } from "../repositories/user.repository";

export const USERS_TYPES = {
  UserController: Symbol.for("UserController"),
  PasswordPolicy: Symbol.for("PasswordPolicy"),
  UserRegisterUseCase: Symbol.for("UserRegisterUseCase"),
  PasswordHasher: Symbol.for("PasswordHasher"),
  ScheduleEmailConfirmationOnUserRegistered: Symbol.for(
    "ScheduleEmailConfirmationOnUserRegistered"
  ),
  UserRepository: Symbol.for("UserRepository"),
  VerifyEmailUseCase: Symbol.for("VerifyEmailUseCase"),
};
