import { GenericEvent } from "../../events/generic-events.interface";

export interface EmailEvent<TEventName extends string, TPayload = unknown> extends GenericEvent<TEventName,TPayload>{}