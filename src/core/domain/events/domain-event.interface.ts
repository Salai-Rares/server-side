import { GenericEvent } from "../../application/events/generic-events.interface";

export interface DomainEvent<TEventName extends string, TPayload = unknown>
  extends GenericEvent<TEventName, TPayload> {
  readonly aggregateId: string;
}
