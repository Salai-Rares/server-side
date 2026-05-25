import { DomainEvent } from "@/core/domain/events/domain-event.interface";

export interface IDomainEventHandler<
  T extends DomainEvent<string, unknown> = DomainEvent<string, unknown>
> {
  eventName: string;
  handle(event: T): Promise<void>;
}
