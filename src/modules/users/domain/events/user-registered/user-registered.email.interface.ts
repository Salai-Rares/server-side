import { DOMAIN_EVENT_NAMES } from "@/modules/users/domain/events/events-names.constants";
import { EmailEvent } from "../../../../../core/application/email/events/emal.event.interface";
import { payloadUserRegisteredEvent } from "@/modules/users/domain/events/user-registered/user-registered.domain.interface";
import { randomUUID } from "crypto";

 
export interface EmailConfirmationEvent extends EmailEvent< typeof DOMAIN_EVENT_NAMES.USER_REGISTERED,payloadUserRegisteredEvent>{}


export interface UserRegisteredEmailConfirmationEvent
  extends EmailEvent<
    typeof DOMAIN_EVENT_NAMES.USER_REGISTERED,
    payloadUserRegisteredEvent
  > {
  
}
export const createEmailConfirmationEvent = (payload:payloadUserRegisteredEvent): EmailConfirmationEvent => {
return {
    id:randomUUID(),
    occurredAt : new Date(),
    eventName:DOMAIN_EVENT_NAMES.USER_REGISTERED,
    payload:payload
}
}