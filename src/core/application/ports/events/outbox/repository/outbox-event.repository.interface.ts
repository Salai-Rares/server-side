import { ClientSession } from "mongoose";
import {
  ErrorOutboxEvent,

  OutboxEventDto,
} from "../types/outbox-event.types";
import { unknown } from "zod";
import { DomainEvent } from "@/core/domain/events/domain-event.interface";
export type OutboxStatus = "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";

export type ClaimPendingBatchParams = {
  limit: number;
  leaseMs: number;
  lockedBy:string;
  now: Date;
};

export type MarkFailedParams = {
  error: string;
  nextAttemptAt: Date;
};

export type MarkPublishedParams = {
  publishedAt: Date;
};

export type OutboxPublishResult = {
  claimed: number;
};

export interface IOutboxEventRepository {
  saveDomainEvent(
    event: DomainEvent<string>,
    options?: { session?: ClientSession }
  ): Promise<void>;

  saveManyDomainEvents(
    events: DomainEvent<string>[],
    options?: { session?: ClientSession }
  ): Promise<void>;

  getPendingBatch(
    limit: number,
    options?: { session?: ClientSession }
  ): Promise<OutboxEventDto[]>;
  markAsSent(id: string,sentAt:Date, options?: { session?: ClientSession }): Promise<void>;
  markAsFailed(
    id: string,
    params:{
    
      error:unknown;
      retryCount:number;
      nextAttemptAt:Date;
    },
    options?: { session?: ClientSession }
  ): Promise<void>;
  markAsDead(
    id: string,
     params: {
      error: unknown;
      retryCount:number;
    },
    options?: { session?: ClientSession }
  ): Promise<void>
  claimPendingBatch(params:ClaimPendingBatchParams, options?: { session?: ClientSession }):Promise<OutboxEventDto[]>
  releaseExpiredLocks(now: Date): Promise<void>
  getOutboxEventByID(id:string,options?: { session?: ClientSession }):Promise<OutboxEventDto | null>
}
