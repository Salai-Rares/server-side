import { ContainerModule, interfaces } from "inversify";

import { USERS_TYPES } from "./users.symbols";
import { PasswordPolicy } from "../../domain/services/password-policy.service";
import { UserRegisterUseCase } from "../../application/use-cases/register/user-register.use-case";
import { IUserRegisterUseCase } from "../../application/use-cases/register/user-register.interface";
import { IPasswordHasher } from "../../application/ports/password-hasher.port";
import { BcryptPasswordHasher } from "../services/bcrypt-password-hasher.service";
import { IDomainEventHandler } from "@/core/application/ports/events/outbox/handlers/domain-event.handler.interface";
import { EVENTS_SYMBOLS } from "@/infrastructure/events/events.symbols";
import { ScheduleEmailConfirmationOnUserRegistered } from "../../domain/events/user-registered/user-registered.domain.handler";
import { IUserRepository } from "../../application/ports/repositories/user.repository.interface";
import { UserRepository } from "../repositories/user.repository";
import { IEmailEventHandler } from "@/core/application/ports/events/outbox/handlers/email-event.handler.interface";
import { ConfirmationEmailHandler } from "../../domain/events/user-registered/user-registered.email.handler";
import { IVerifyEmailUseCase } from "../../application/use-cases/verify-email/verify-email.use-case.interface";
import { VerifyEmailUseCase } from "../../application/use-cases/verify-email/verify-email.use-case";

export const usersModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<PasswordPolicy>(PasswordPolicy).toSelf().inSingletonScope();
  bind<IUserRegisterUseCase>(USERS_TYPES.UserRegisterUseCase)
    .to(UserRegisterUseCase)
    .inSingletonScope();
  bind<IPasswordHasher>(USERS_TYPES.PasswordHasher)
    .to(BcryptPasswordHasher)
    .inSingletonScope();
  bind<IDomainEventHandler>(EVENTS_SYMBOLS.DomainEventHandler).to(
    ScheduleEmailConfirmationOnUserRegistered,
  );
  bind<IUserRepository>(USERS_TYPES.UserRepository)
    .to(UserRepository)
    .inSingletonScope();
  bind<IEmailEventHandler>(EVENTS_SYMBOLS.EmailEventHandler).to(
    ConfirmationEmailHandler,
  );
  bind<IVerifyEmailUseCase>(USERS_TYPES.VerifyEmailUseCase)
    .to(VerifyEmailUseCase)
    .inSingletonScope();
});
