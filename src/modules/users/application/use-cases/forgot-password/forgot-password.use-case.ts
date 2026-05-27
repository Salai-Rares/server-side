import { injectable, inject } from "inversify";
import { IForgotPasswordUseCase } from "./forgot-password.use-case.interface";
import { IUserRepository } from "../../ports/repositories/user.repository.interface";
import { IOutboxEventRepository } from "@/core/application/ports/events/outbox/repository/outbox-event.repository.interface";
import { USERS_TYPES } from "@/modules/users/infrastructure/di/users.symbols";
import { OUTBOX_SYMBOLS } from "@/infrastructure/events/outbox/outbox.symbols";
import { createPasswordResetRequestedDomainEvent } from "@/modules/users/domain/events/password-reset-requested/password-reset-requested.domain.interface";

@injectable()
export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    @inject(USERS_TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(OUTBOX_SYMBOLS.OutboxRepository) private outboxRepository: IOutboxEventRepository
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return; // silently succeed — don't reveal whether account exists

    const event = createPasswordResetRequestedDomainEvent({
      userId: user.id,
      email: user.emailAddress,
      firstName: user.firstName,
    });

    await this.outboxRepository.saveManyDomainEvents([event]);
  }
}
