import { IDomainEventHandler } from "@/core/application/ports/events/outbox/handlers/domain-event.handler.interface";
import { UserRegisteredDomainEvent } from "./user-registered.domain.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "@/shared/types";
import { IEmailService } from "@/core/application/ports/email/email-service.interface";
import { ITokenService } from "@/core/application/ports/email/email-token-service.interface";
import { ConfirmationTokenType } from "@/core/application/ports/token/confirmation-token-kind.enum";
import { EVENTS_SYMBOLS } from "@/infrastructure/events/events.symbols";
import { Queue } from "bullmq";
import { DOMAIN_EVENT_NAMES } from "../events-names.constants";
import {
  DEFAULT_EVENT_JOB_OPTIONS,
  DOMAIN_EVENT_JOB_OPTIONS,
} from "@/infrastructure/events/publishers/domain/domain-event-job-options.constants";
import { isJobIdConflict } from "@/infrastructure/events/publishers/domain/bullmq-domain-event-publisher";
import { IOutboxEventRepository } from "@/core/application/ports/events/outbox/repository/outbox-event.repository.interface";
import { OUTBOX_SYMBOLS } from "@/infrastructure/events/outbox/outbox.symbols";
import { MAX_HANDLER_RETRIES } from "@/core/application/ports/events/outbox/types/outbox-event.types";
import { backoffMs } from "@/shared/utils/retry";
import { createEmailConfirmationEvent } from "@/modules/users/domain/events/user-registered/user-registered.email.interface";
@injectable()
export class ScheduleEmailConfirmationOnUserRegistered
  implements IDomainEventHandler<UserRegisteredDomainEvent>
{
  eventName: string = DOMAIN_EVENT_NAMES.USER_REGISTERED;
  constructor(
    // @inject(TYPES.EmailServiceAdapter)
    // private emailService: IEmailService,
    // @inject(TYPES.ConfirmationTokenService)
    // private tokenService: IConfirmationTokenService
    @inject(EVENTS_SYMBOLS.EmailQueue) private emailQueue: Queue,
    @inject(OUTBOX_SYMBOLS.OutboxRepository)
    private outboxRepo: IOutboxEventRepository
  ) {}
  async handle(event: UserRegisteredDomainEvent): Promise<void> {
    const options =
      DOMAIN_EVENT_JOB_OPTIONS[DOMAIN_EVENT_NAMES.USER_REGISTERED] ?? DEFAULT_EVENT_JOB_OPTIONS;
     const confirmEmailEvent =  createEmailConfirmationEvent(event.payload)
    const userRegisteredOptions = {
      ...options,
      //idempotency : same event id => same job id
      jobId: event.id,
    };
    try {
      await this.emailQueue.add(confirmEmailEvent.eventName, confirmEmailEvent, userRegisteredOptions);
    } catch (e: unknown) {
      if (isJobIdConflict(e)) return;
      const outboxEvent = await this.outboxRepo.getOutboxEventByID(event.id);
      if (!outboxEvent) return;
      const retryCount = (outboxEvent.error?.retryCount ?? 0) + 1;
      if (retryCount >= MAX_HANDLER_RETRIES) {
        await this.outboxRepo.markAsDead(event.id, { error: e, retryCount });
        return;
      }
      await this.outboxRepo.markAsFailed(event.id, {
        error: e,
        retryCount,
        nextAttemptAt: new Date(Date.now() + backoffMs(retryCount)),
      });
    }
    // const token = await this.tokenService.generateToken(event.payload.email,ConfirmationTokenType.EmailVerification);
    // await this.emailService.sendEmailConfirmation(event.payload.email, token);
  }
}
