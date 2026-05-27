import { DomainEvent } from "@/core/domain/events/domain-event.interface";
import { DOMAIN_EVENT_NAMES } from "../events-names.constants";
import { randomUUID } from "crypto";

export interface PasswordResetRequestedPayload {
  userId: string;
  email: string;
  firstName: string;
}

export interface PasswordResetRequestedDomainEvent
  extends DomainEvent<
    typeof DOMAIN_EVENT_NAMES.PASSWORD_RESET_REQUESTED,
    PasswordResetRequestedPayload
  > {}

export const createPasswordResetRequestedDomainEvent = (
  payload: PasswordResetRequestedPayload
): PasswordResetRequestedDomainEvent => ({
  id: randomUUID(),
  occurredAt: new Date(),
  aggregateId: payload.userId,
  eventName: DOMAIN_EVENT_NAMES.PASSWORD_RESET_REQUESTED,
  payload,
});
