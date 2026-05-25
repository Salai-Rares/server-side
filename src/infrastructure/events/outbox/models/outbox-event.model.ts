import mongoose, { Model, Schema } from "mongoose";
import {
  IDomainOutboxEventDocument,
  IIntegrationOutboxEventDocument,
  IOutboxEventDocument,
} from "./outbox-event.model.interface";
import {
  eventTypeOptions,

  statusEventOptions,
} from "@/core/application/ports/events/outbox/types/outbox-event.types";
import { ErrorOutboxEvent } from "@/core/application/ports/events/outbox/types/outbox-event.types";
import { OUTBOX_LIMITS } from "@/core/application/events/outbox.constants";
const OutboxErrorEvent = new Schema<ErrorOutboxEvent>({
  stack: {
    type: String,
    maxlength: OUTBOX_LIMITS.STACK.maxLength,
    minlength: OUTBOX_LIMITS.STACK.minLength,
  },
  attemptedAt: { type: Date, required: true },
  nextAttemptAt:{type:Date,required:true,index:true},
  retryCount: { type: Number, required: true },
  errorMessage: {
    type: String,
    required: true,
    minlength: OUTBOX_LIMITS.ERROR_MESSAGE.minLength,
    maxlength: OUTBOX_LIMITS.ERROR_MESSAGE.maxLength,
  },

},{_id:false});

const BaseOutboxEventSchema = new Schema<IOutboxEventDocument>(
  { 
       _id: { type: String, required: true ,unique:true},  // UUID
    status: {
      type: String,
      enum: statusEventOptions,
      default:"pending",
      required: true,
      minlength: OUTBOX_LIMITS.STATUS.minLength,
      maxlength: OUTBOX_LIMITS.STATUS.maxLength,
      index:true
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
      minlength: OUTBOX_LIMITS.EVENT_NAME.minLength,
      maxlength: OUTBOX_LIMITS.EVENT_NAME.maxLength,
      index:true
    },
    payload: { type: Schema.Types.Mixed, required: true },
    occurredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    //dispatcher controls
    lockedUntil : {type:Date,index:true},
    lockedBy: {type:String,index:true},
    


    error: OutboxErrorEvent,
    sentAt: { type: Date }, // in case status is sent so we keep it optional
  },
  {
    discriminatorKey: "eventType",
    timestamps:true
  }
);
BaseOutboxEventSchema.index({ status: 1, nextAttemptAt: 1, occurredAt: 1 });
BaseOutboxEventSchema.index({ status: 1, lockedUntil: 1 });
BaseOutboxEventSchema.index({ eventType: 1, status: 1 }); 
const OutboxEventModel: Model<IOutboxEventDocument> = mongoose.model(
  "OutboxEvent",
  BaseOutboxEventSchema
);
// Domain discriminator
const DomainOutboxEventModel: Model<IDomainOutboxEventDocument> =
  OutboxEventModel.discriminator(
    "domain",
    new Schema({
      aggregateId: { type: String, required: true, index: true },

    })
  );

// Integration discriminator
const IntegrationOutboxEventModel: Model<IIntegrationOutboxEventDocument> =
  OutboxEventModel.discriminator("integration", new Schema({}));

export {
  OutboxEventModel,
  DomainOutboxEventModel,
  IntegrationOutboxEventModel,
};
export default OutboxEventModel;
