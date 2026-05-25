import { injectable, inject } from "inversify";
import { IUserRegisterUseCase } from "./user-register.interface";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { CreateUserHttpDto } from "../../../presentation/schemas/create-user.schema";
import { USERS_TYPES } from "@/modules/users/infrastructure/di/users.symbols";
import { PasswordPolicy } from "@/modules/users/domain/services/password-policy.service";
import { EVENTS_SYMBOLS } from "@/infrastructure/events/events.symbols";

import { CreateUserCommand } from "../../dtos/auth/register.dto";
import { UserRegisterProps } from "@/modules/users/domain/entities/user.types";
import { TYPES } from "@/shared/types";
import { IIdGenerator } from "@/core/application/ports/id/id-generator.interface";
import { IPasswordHasher } from "../../ports/password-hasher.port";
import { IDomainEventPublisher } from "@/core/application/ports/events/outbox/publishers/domain-event-publisher.interface";
import { OUTBOX_SYMBOLS } from "@/infrastructure/events/outbox/outbox.symbols";
import { IOutboxEventRepository } from "@/core/application/ports/events/outbox/repository/outbox-event.repository.interface";
import { IUserRepository } from "../../ports/repositories/user.repository.interface";
import mongoose from "mongoose";
import { ILogger } from "@/core/logger/logger.interface";
import { ApiError } from "@/shared/errors/api-error/ApiError";

@injectable()
export class UserRegisterUseCase implements IUserRegisterUseCase {
  constructor(
    @inject(PasswordPolicy)
    private passwordPolicyService: PasswordPolicy,
    @inject(EVENTS_SYMBOLS.DomainEventPublisher)
    private domainEventPublisher: IDomainEventPublisher,
    @inject(TYPES.IdGenerator) private idGenerator: IIdGenerator,
    @inject(USERS_TYPES.PasswordHasher) private passwordHasher: IPasswordHasher,
    @inject(OUTBOX_SYMBOLS.OutboxRepository)
    private outboxRepository: IOutboxEventRepository,
    @inject(USERS_TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}
  async execute(userDto: CreateUserCommand): Promise<UserEntity> {
    //start the event for email sending
    //verify the password policy
    //hash the password
    //map the object with hashed password to the entity
    const session = await mongoose.startSession();
    let result: UserEntity | undefined;
    try {
      await session.withTransaction(async () => {
        const { password, ...rest } = userDto;
        const passwordHash: string = await this.passwordHasher.hash(password);
        this.passwordPolicyService.validate(userDto.password);
        const userRegisterProps: UserRegisterProps = {
          id: this.idGenerator.generate(),
          passwordHash,
          ...rest,
        };
        // console.log("user register props:", userRegisterProps);
        const user: UserEntity = UserEntity.register(userRegisterProps);
        result = user;
        await this.userRepository.saveUser(user, { session });
        const domainEvents = user.pullDomainEvents();
        console.log(domainEvents);
        await this.outboxRepository.saveManyDomainEvents(domainEvents, {
          session,
        });
      });
      if (!result) {
        throw ApiError.internalError(
          "Transaction completed but returned no result",
          new Error("Transaction result is undefined")
        );
      }
      return result;
    } finally {
      try {
        await session.endSession();
      } catch (cleanupError) {
        this.logger.warn("Failed to close MongoDB session", {
          error:
            cleanupError instanceof Error ? cleanupError.message : cleanupError,
          stack: cleanupError instanceof Error ? cleanupError.stack : undefined,
          operation: "product_creation",
          sessionId: session.id,
        });
      }
    }

    // this.domainEventPublisher.publish(domainEvents);
  }
}
