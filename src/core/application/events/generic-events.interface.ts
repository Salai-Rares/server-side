export interface GenericEvent<TEventName extends string, TPayload = unknown> {
  readonly id: string;
  readonly occurredAt: Date;
  readonly eventName: TEventName;
  readonly payload: TPayload;

}