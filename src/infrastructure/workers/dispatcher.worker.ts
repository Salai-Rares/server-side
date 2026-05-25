import dotenv from "dotenv";
import { Container } from "inversify";
import { outboxDispatchersModule } from "../events/outbox/dispatchers/dispatchers.module";
import { IOutboxDispatcherEvents } from "@/core/application/ports/events/outbox/events-dispatcher.interface";
import { eventsModule } from "../events/events.module";
import { QUEUE_NAMES } from "@/core/application/events/events.constants";
import { Queue } from "bullmq";
import { Worker, Job } from "bullmq";
import os from "os";
import { outboxModule } from "../events/outbox/outbox.module";
import { IOutboxEventRepository } from "@/core/application/ports/events/outbox/repository/outbox-event.repository.interface";
import {
  MAX_HANDLER_RETRIES,
  OutboxEventDto,
} from "@/core/application/ports/events/outbox/types/outbox-event.types";
import { OUTBOX_SYMBOLS } from "../events/outbox/outbox.symbols";

import { buildWorkerContainer } from "../di/container.worker";
import { OUTBOX_DISPATCHERS_SYMBOLS } from "../events/outbox/dispatchers/dispatchers.symbols";
import connectDB from "@/db/connect";
import { backoffMs } from "@/shared/utils/retry";
dotenv.config();
const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};
const SCHEDULER_ID = "dispatcher-scheduler";
const SCHEDULER_EVERY_MS = 5_000;

const BATCH_SIZE = 100;
const LEASE_MS = 60_000;

function instanceId(): string {
  return process.env.HOSTNAME ?? `${os.hostname()}-${process.pid}`;
}

async function bootstrapWorker() {
  const container: Container = buildWorkerContainer();
  container.load(outboxDispatchersModule);
  container.load(eventsModule);

  await connectDB(process.env.MONGO_URI!);

  const allDispatchers = container.getAll<IOutboxDispatcherEvents>(
    OUTBOX_DISPATCHERS_SYMBOLS.AllOutboxDispatchers
  );

  const outboxRepo = container.get<IOutboxEventRepository>(
    OUTBOX_SYMBOLS.OutboxRepository
  );

  const dispatchersMap = new Map<string, IOutboxDispatcherEvents>();
  for (const dispatcher of allDispatchers) {
    dispatchersMap.set(dispatcher.eventType, dispatcher);
    console.log(`Registered dispatcher for eventType=${dispatcher.eventType}`);
  }

  const queueName = QUEUE_NAMES.outbox_dispatcher;

  const dispatcherQueue = new Queue(queueName, { connection });
  await dispatcherQueue.upsertJobScheduler(
    SCHEDULER_ID,
    {
      every: SCHEDULER_EVERY_MS,
    },
    {
      name: "interogate-outbox",
      opts: {
        removeOnComplete: true,
        removeOnFail: false,
      },
    }
  );

  const worker = new Worker(
    queueName,
    async (job: Job) => {
      const now = new Date();
      const lockedBy = instanceId();
      // 1) Recover stuck claims (dispatcher crashed while processing)
      await outboxRepo.releaseExpiredLocks(now);

      const events: OutboxEventDto[] = await outboxRepo.claimPendingBatch({
        limit: BATCH_SIZE,
        leaseMs: LEASE_MS,
        lockedBy,
        now,
      });

      let sent = 0;
      let failed = 0;
      let dead = 0;

      for (const event of events) {
        console.log(`Processing outbox event id=${event.id} type=${event.eventType} retryCount=${event.error?.retryCount ?? 0}`);
        const dispatcher = dispatchersMap.get(event.eventType);

        if (!dispatcher) {
          const err = new Error(
            `No dispatcher registered for eventType=${event.eventType}`
          );
          console.error('wtf no dispatcher for event');
          await outboxRepo.markAsDead(event.id, { error: err, retryCount: 1 });
          dead++;
          continue;
        }

        try {
          await dispatcher.dispatch(event);
          await outboxRepo.markAsSent(event.id, new Date());
          sent++;
        } catch (err) {
          console.error(`Error dispatching event id=${event.id} type=${event.eventType}`, err);
          const retryCount = (event.error?.retryCount ?? 0) + 1;
          if (retryCount >= MAX_HANDLER_RETRIES) {
            await outboxRepo.markAsDead(event.id, { error: err, retryCount });
            dead += 1;
            continue;
          }
          await outboxRepo.markAsFailed(event.id, {
            error: err,
            retryCount,
            nextAttemptAt: new Date(Date.now() + backoffMs(retryCount)),
          });
          failed += 1;
        }
      }
      return { claimed: events.length, sent, failed, dead };
    },
    { connection, concurrency: 1 }
  );

  async function shutdown(signal: string) {
    console.log(`[DispatcherWorker] shutting down (${signal})...`);
    try {
      await worker.close();
      await dispatcherQueue.close();
    } finally {
      process.exit(0);
    }
  }

  worker.on("completed", (job) => {
    console.log(`[DispatcherWorker] Job ${job.id} for ${job.name} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[DispatcherWorker] Job ${job?.id} for ${job?.name} failed:`,
      err
    );
  });

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  
  console.log("[DispatcherWorker] Listening for jobs...");
}

bootstrapWorker().catch((err) => {
  console.error("Worker bootstrap failed", err);
  process.exit(1);
});
