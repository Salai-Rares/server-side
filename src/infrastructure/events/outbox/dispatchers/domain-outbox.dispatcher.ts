import { IOutboxDispatcherEvents } from "@/core/application/ports/events/outbox/events-dispatcher.interface";
import { IDomainEventPublisher } from "@/core/application/ports/events/outbox/publishers/domain-event-publisher.interface";
import {
    EventType,
  IDomainOutboxEventWithId,
  OutboxEventDto,
} from "@/core/application/ports/events/outbox/types/outbox-event.types";
import { DomainEvent } from "@/core/domain/events/domain-event.interface";
import { EVENTS_SYMBOLS } from "@/infrastructure/events/events.symbols";
import { inject, injectable } from "inversify";

@injectable()
export class DomainOutboxDispatcher implements IOutboxDispatcherEvents {
    readonly eventType: EventType = 'domain'
  constructor(
    @inject(EVENTS_SYMBOLS.DomainEventPublisher)
    private domainEventPublisher: IDomainEventPublisher
  ) {}
  async dispatch(outboxEventDto: OutboxEventDto): Promise<void> {
    const event = outboxEventDto as IDomainOutboxEventWithId;
    const domainEvent: DomainEvent<string> = {
      id: event.id,
      occurredAt: event.occurredAt,
      eventName: event.eventName,
      payload: event.payload,
      aggregateId: event.aggregateId,
    };
    await this.domainEventPublisher.publish([domainEvent])
  }
}
