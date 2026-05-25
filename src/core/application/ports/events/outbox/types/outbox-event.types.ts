export const eventTypeOptions = ["domain", "integration"] as const;
export type EventType = (typeof eventTypeOptions)[number];

export const statusEventOptions = [
  "pending",
  "processing",
  "sent",
  "failed",
  "dead",
] as const;

export const OUTBOX_STATUS = Object.fromEntries(
  statusEventOptions.map((value) => [value.toUpperCase(), value])
) as {
  [K in Uppercase<
    (typeof statusEventOptions)[number]
  >]: (typeof statusEventOptions)[number];
};

export type StatusEventType = (typeof statusEventOptions)[number];
export const MAX_HANDLER_RETRIES = 5;


export interface ErrorOutboxEvent {
  retryCount: number;
  errorMessage: string;

  stack?: string;
  attemptedAt: Date;
  nextAttemptAt:Date;
}

export interface CommonOutboxProperties {
  eventName: string;
  eventType: EventType; // discriminator key
  status: StatusEventType;
  payload: unknown;
  occurredAt: Date;

  //dispatcher controls
  lockedUntil?:Date;
  lockedBy?:string;
 

  error?: ErrorOutboxEvent;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDomainOutboxEvent extends CommonOutboxProperties {
  aggregateId: string;
  eventType: "domain";
}

export interface IDomainOutboxEventWithId extends IDomainOutboxEvent {
   id: string;
}

export interface IIntegrationOutboxEvent extends CommonOutboxProperties {
  eventType: "integration";
}

export interface IIntegrationOutboxEventWithId extends IIntegrationOutboxEvent{
     id: string;
}

export type IOutboxEventCombined = IDomainOutboxEvent  | IIntegrationOutboxEvent;


export type OutboxEventDto = IOutboxEventCombined & {
  id: string;
};
