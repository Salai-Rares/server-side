import { injectable, inject } from "inversify";
import { IDomainEventHandler } from "@/core/application/ports/events/outbox/handlers/domain-event.handler.interface";
import { DOMAIN_EVENT_NAMES } from "../events-names.constants";
import { PasswordResetRequestedDomainEvent } from "./password-reset-requested.domain.interface";
import { createPasswordResetEmailEvent } from "./password-reset-requested.email.interface";
import { EVENTS_SYMBOLS } from "@/infrastructure/events/events.symbols";
import { OUTBOX_SYMBOLS } from "@/infrastructure/events/outbox/outbox.symbols";
import { IOutboxEventRepository } from "@/core/application/ports/events/outbox/repository/outbox-event.repository.interface";
import { Queue } from "bullmq";
import {
  DEFAULT_EVENT_JOB_OPTIONS,
  DOMAIN_EVENT_JOB_OPTIONS,
} from "@/infrastructure/events/publishers/domain/domain-event-job-options.constants";
import { isJobIdConflict } from "@/infrastructure/events/publishers/domain/bullmq-domain-event-publisher";
import { MAX_HANDLER_RETRIES } from "@/core/application/ports/events/outbox/types/outbox-event.types";
import { backoffMs } from "@/shared/utils/retry";

@injectable()
export class SchedulePasswordResetEmailHandler
  implements IDomainEventHandler<PasswordResetRequestedDomainEvent>
{
  eventName = DOMAIN_EVENT_NAMES.PASSWORD_RESET_REQUESTED;

  constructor(
    @inject(EVENTS_SYMBOLS.EmailQueue) private emailQueue: Queue,
    @inject(OUTBOX_SYMBOLS.OutboxRepository) private outboxRepo: IOutboxEventRepository
  ) {}

  async handle(event: PasswordResetRequestedDomainEvent): Promise<void> {
    const options =
      DOMAIN_EVENT_JOB_OPTIONS[DOMAIN_EVENT_NAMES.PASSWORD_RESET_REQUESTED] ??
      DEFAULT_EVENT_JOB_OPTIONS;

    const emailEvent = createPasswordResetEmailEvent(event.payload);

    try {
      await this.emailQueue.add(emailEvent.eventName, emailEvent, {
        ...options,
        jobId: event.id,
      });
    } catch (e: unknown) {
      console.log("Error scheduling email job for event", event, "Error:", e);  
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
  }
}
