import { EventType, OutboxEventDto } from "./types/outbox-event.types";

export interface IOutboxDispatcherEvents {
    eventType: EventType;
    dispatch(outboxEventDto : OutboxEventDto) :Promise<void>
}