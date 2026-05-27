import { EmailEvent } from "@/core/application/email/events/emal.event.interface";
import { DOMAIN_EVENT_NAMES } from "../events-names.constants";
import { PasswordResetRequestedPayload } from "./password-reset-requested.domain.interface";
import { randomUUID } from "crypto";

export interface PasswordResetEmailEvent
  extends EmailEvent<
    typeof DOMAIN_EVENT_NAMES.PASSWORD_RESET_REQUESTED,
    PasswordResetRequestedPayload
  > {}

export const createPasswordResetEmailEvent = (
  payload: PasswordResetRequestedPayload
): PasswordResetEmailEvent => ({
  id: randomUUID(),
  occurredAt: new Date(),
  eventName: DOMAIN_EVENT_NAMES.PASSWORD_RESET_REQUESTED,
  payload,
});
