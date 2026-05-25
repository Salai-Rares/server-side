import {
  ClaimPendingBatchParams,
  IOutboxEventRepository,
} from "@/core/application/ports/events/outbox/repository/outbox-event.repository.interface";
import {
  OutboxEventDto,
  ErrorOutboxEvent,
  OUTBOX_STATUS,
  MAX_HANDLER_RETRIES,
} from "@/core/application/ports/events/outbox/types/outbox-event.types";
import { DomainEvent } from "@/core/domain/events/domain-event.interface";
import { ClientSession } from "mongoose";

import { eventNames } from "process";
import { toObjectId } from "@/shared/utils";
import OutboxEventModel, {
  DomainOutboxEventModel,
} from "../models/outbox-event.model";
import { injectable } from "inversify";
@injectable()
export class OutboxEventRepository implements IOutboxEventRepository {
 async getOutboxEventByID(id: string, options?: { session?: ClientSession; }): Promise<OutboxEventDto> {
    const doc = await OutboxEventModel.findById(id).session(options?.session || null)
    return this.toDto(doc)
  }
  async saveDomainEvent(
    event: DomainEvent<string>,
    options?: { session?: ClientSession }
  ): Promise<void> {
    await DomainOutboxEventModel.create(
      [
        {
          _id: event.id,
          status: OUTBOX_STATUS.PENDING,
          eventName: event.eventName,
          payload: event.payload,
          occurredAt: event.occurredAt,
          aggregateId: event.aggregateId,
        },
      ],
      { session: options?.session }
    );
  }
  async saveManyDomainEvents(
    events: DomainEvent<string>[],
    options?: { session?: ClientSession }
  ): Promise<void> {
    const docs = events.map((event) => ({
      _id: event.id,
      status: OUTBOX_STATUS.PENDING,
      eventName: event.eventName,
      payload: event.payload,
      occurredAt: event.occurredAt,
      aggregateId: event.aggregateId,
    }));

    await DomainOutboxEventModel.create(docs, { session: options?.session });
  }
  async getPendingBatch(
    limit: number,
    options?: { session?: ClientSession }
  ): Promise<OutboxEventDto[]> {
    // First, get pending events
    const pendingDocs = await OutboxEventModel.find({ status: "pending" })
      .session(options?.session || null)
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean()
      .exec();

    const remainingLimit = limit - pendingDocs.length;

    // If we haven't reached the limit, get failed events that can be retried
    let failedDocs: any[] = [];
    if (remainingLimit > 0) {
      failedDocs = await OutboxEventModel.find(
        {
          status: "failed",
          "error.retryCount": { $lt: MAX_HANDLER_RETRIES },
        },
        options?.session
      )
        .sort({ "error.attemptedAt": 1 }) // Retry oldest failed attempts first
        .limit(remainingLimit)
        .lean()
        .exec();
    }

    const allDocs = [...pendingDocs, ...failedDocs];
    return allDocs.map((doc) => this.toDto(doc));
  }
  async markAsSent(
    id: string,
    sentAt: Date,
    options?: { session?: ClientSession }
  ): Promise<void> {
    await OutboxEventModel.updateOne(
      { _id: id },
      {
        $set: { status: OUTBOX_STATUS.SENT, sentAt },
        $unset: { lockedUntil: 1, lockedBy: 1, nextAttemptAt: 1, error: 1 },
      },
      // {
      //   status: OUTBOX_STATUS.SENT,
      //   sentAt: sentAt,
      // },
      { session: options?.session }
    );
  }
  async markAsFailed(
    id: string,
    params: {
      error: unknown;
      retryCount: number;
      nextAttemptAt: Date;
    },
    options?: { session?: ClientSession }
  ): Promise<void> {
    const { error, retryCount, nextAttemptAt } = params;
    const err =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: String(error), stack: undefined };
    await OutboxEventModel.updateOne(
      { _id: id },
      {
        // status: OUTBOX_STATUS.FAILED,
        $set: {
          status:
            retryCount >= MAX_HANDLER_RETRIES
              ? OUTBOX_STATUS.DEAD
              : OUTBOX_STATUS.FAILED,
          error: {
            attemptedAt: new Date(),
            retryCount,
            errorMessage: err.message,
            stack: err.stack,

            nextAttemptAt,
          },
        },
        $unset: { lockedUntil: 1, lockedBy: 1 },
      },
      { session: options?.session }
    );
  }
  async markAsDead(
    id: string,
    params: {
      error: unknown;
      retryCount: number;
    },
    options?: { session?: ClientSession }
  ): Promise<void> {
    const { error, retryCount } = params;
    let message: string = "";
    let stack: string | undefined = "";
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack?.substring(0, 500);
    } else {
      message = String(error);
      stack = undefined;
    }
    await OutboxEventModel.updateOne(
      { _id: id },
      {
        $set: {
          status:OUTBOX_STATUS.DEAD,
          error: {
            attemptedAt: new Date(),
            retryCount,
            errorMessage: message,
            stack: stack,
          },
        },
        $unset: {
          lockedUntil: 1,
          lockedBy: 1,
        },
      },
      { session: options?.session }
    );
  }

  // Helper method to convert Mongoose lean document to DTO
  private toDto(doc: any): OutboxEventDto {
    const base = {
      id: doc._id.toString(),
      eventName: doc.eventName,
      status: doc.status,
      payload: doc.payload,
      createdAt: doc.createdAt,
      error: doc.error,
      sentAt: doc.sentAt,
      occurredAt: doc.occurredAt,
      updatedAt: doc.updatedAt,
    };

    if (doc.eventType === "domain") {
      return {
        ...base,
        eventType: "domain" as const,
        aggregateId: doc.aggregateId,
      };
    } else {
      return {
        ...base,
        eventType: "integration" as const,
      };
    }
  }

  async claimPendingBatch(
    params: ClaimPendingBatchParams,
    options?: { session?: ClientSession }
  ): Promise<OutboxEventDto[]> {
    const { limit, leaseMs, lockedBy, now } = params;
    const lockedUntil = new Date(now.getTime() + leaseMs);

    const candidates = await OutboxEventModel.find({
      status: { $in: [OUTBOX_STATUS.PENDING, OUTBOX_STATUS.FAILED] },
      $or: [
        { status: OUTBOX_STATUS.PENDING },
        {
          status: OUTBOX_STATUS.FAILED,
          "error.nextAttemptAt": { $lte: now },
        },
        {
          status: OUTBOX_STATUS.FAILED,
          "error.nextAttemptAt": { $exists: false },
        },
      ],
    })
      .session(options?.session || null)
      .sort({ occurredAt: 1 })
      .limit(limit)
      .lean();

    const claimed: OutboxEventDto[] = [];
    for (const c of candidates) {
      const updated = await OutboxEventModel.findOneAndUpdate(
        {
          _id: c._id,
          status: c.status,
        },
        {
          $set: { status: OUTBOX_STATUS.PROCESSING, lockedUntil, lockedBy },
        },
        {
          new: true,
          session: options?.session,
          lean: true
        }
      );

     if (updated) claimed.push(this.toDto(updated));
    }
    return claimed;
  }
  async releaseExpiredLocks(now: Date): Promise<void> {
    await OutboxEventModel.updateMany(
      { status: "processing", lockedUntil: { $lt: now } },
      { $set: { status: "pending" }, $unset: { lockedUntil: 1, lockedBy: 1 } }
    );
  }
}
