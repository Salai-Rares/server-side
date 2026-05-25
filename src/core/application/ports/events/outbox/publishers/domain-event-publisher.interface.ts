// src/core/application/events/domain-event-publisher.interface.ts
import { DomainEvent } from "@/core/domain/events/domain-event.interface";

export interface IDomainEventPublisher {
  publish(events: DomainEvent<string>[]): Promise<void>;
}
