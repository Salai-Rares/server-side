export const USERS_TYPES = {
  UserController: Symbol.for("UserController"),
  PasswordPolicy: Symbol.for("PasswordPolicy"),
  UserRegisterUseCase: Symbol.for("UserRegisterUseCase"),
  UserLoginUseCase: Symbol.for("UserLoginUseCase"),
  ForgotPasswordUseCase: Symbol.for("ForgotPasswordUseCase"),
  ResetPasswordUseCase: Symbol.for("ResetPasswordUseCase"),
  PasswordHasher: Symbol.for("PasswordHasher"),
  ScheduleEmailConfirmationOnUserRegistered: Symbol.for(
    "ScheduleEmailConfirmationOnUserRegistered"
  ),
  UserRepository: Symbol.for("UserRepository"),
  VerifyEmailUseCase: Symbol.for("VerifyEmailUseCase"),
  GuestSessionHandover: Symbol.for("GuestSessionHandover"),
};
