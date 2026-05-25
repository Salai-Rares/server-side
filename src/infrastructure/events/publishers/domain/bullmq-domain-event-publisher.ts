import { IDomainEventPublisher } from "@/core/application/ports/events/outbox/publishers/domain-event-publisher.interface";
import { DomainEvent } from "@/core/domain/events/domain-event.interface";
import { inject, injectable } from "inversify";
import {
  DEFAULT_EVENT_JOB_OPTIONS,
  DOMAIN_EVENT_JOB_OPTIONS,
} from "./domain-event-job-options.constants";
import { EVENTS_SYMBOLS } from "../../events.symbols";
import { Queue } from "bullmq";
export function isJobIdConflict(err: unknown): boolean {
  // BullMQ throws different shapes depending on version.
  // We treat "already exists" as a non-fatal idempotency hit.
  const msg = err instanceof Error ? err.message : String(err);
  return msg.toLowerCase().includes("job") && msg.toLowerCase().includes("exists");
}
@injectable()
export class BullMqDomainEventPublisher implements IDomainEventPublisher {
  constructor(
    @inject(EVENTS_SYMBOLS.DomainEventsQueue)
    private readonly queue: Queue<DomainEvent<string,unknown>>
  ) {}
 async publish(events: DomainEvent<string, unknown>[]): Promise<void> {
    await Promise.all(
      events.map(async (event) => {
        const baseOptions =
          DOMAIN_EVENT_JOB_OPTIONS[event.eventName] ?? DEFAULT_EVENT_JOB_OPTIONS;

        const options = {
          ...baseOptions,
          // idempotency: same event id => same job id
          jobId: event.id,
        };

        try {
          await this.queue.add(event.eventName, event, options);
        } catch (err) {
          // If it already exists, treat as success (idempotent publish)
          if (isJobIdConflict(err)) return;
          throw err;
        }
      })
    );
  }
}
