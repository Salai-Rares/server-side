import { CommonOutboxProperties, IDomainOutboxEvent, IIntegrationOutboxEvent, IOutboxEventCombined } from "@/core/application/ports/events/outbox/types/outbox-event.types";
import { Document, Types } from "mongoose";




export interface IOutboxEventDocument extends CommonOutboxProperties, Document {}
export interface IDomainOutboxEventDocument extends IDomainOutboxEvent, Document {}
export interface IIntegrationOutboxEventDocument extends IIntegrationOutboxEvent, Document {}
