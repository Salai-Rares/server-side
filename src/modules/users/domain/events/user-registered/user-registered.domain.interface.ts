import { IIdGenerator } from "@/core/application/ports/id/id-generator.interface";
import { DomainEvent } from "@/core/domain/events/domain-event.interface";
import { apiContainer } from "@/infrastructure/di/container.api";
import { TYPES } from "@/shared/types";
import { randomUUID } from "crypto";
import { Types } from "mongoose";
import { DOMAIN_EVENT_NAMES } from "../events-names.constants";
export interface UserRegisteredEventParams {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  occurredAt?: Date;
}

export interface payloadUserRegisteredEvent {
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserRegisteredDomainEvent
  extends DomainEvent<
    typeof DOMAIN_EVENT_NAMES.USER_REGISTERED,
    payloadUserRegisteredEvent
  > {
  
}

export const createUserRegisteredDomainEvent = (
  params: UserRegisteredEventParams
): UserRegisteredDomainEvent => ({
  id: randomUUID(),
  occurredAt: params.occurredAt ?? new Date(),
  aggregateId: params.userId,
  eventName: DOMAIN_EVENT_NAMES.USER_REGISTERED,
  payload: {
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
  },
});
