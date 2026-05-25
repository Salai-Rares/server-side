import { IDomainEventHandler } from "@/core/application/ports/events/outbox/handlers/domain-event.handler.interface";
import { DomainEvent } from "@/core/domain/events/domain-event.interface";
import { buildWorkerContainer } from "@/infrastructure/di/container.worker";
import { EVENTS_SYMBOLS } from "@/infrastructure/events/events.symbols";
import { TYPES } from "@/shared/types";
import { Container } from "inversify";
import { Worker, Job } from "bullmq";
import dotenv from "dotenv";
import { QUEUE_NAMES } from "@/core/application/events/events.constants";
import { eventsModule } from "@/infrastructure/events/events.module";
dotenv.config();
async function bootstrapWorker() {
  const container: Container = buildWorkerContainer();
  container.load(eventsModule);
  const allHandlers = container.getAll<IDomainEventHandler>(
    EVENTS_SYMBOLS.DomainEventHandler
  );

  const handlersMap = new Map<string, IDomainEventHandler[]>();
  for (const handler of allHandlers) {
    const list = handlersMap.get(handler.eventName) ?? [];
    list.push(handler);
    handlersMap.set(handler.eventName, list);
  }

  const worker = new Worker<DomainEvent<string>>(
    QUEUE_NAMES.domain_queue,
    async (job: Job<DomainEvent<string>>) => {
      const eventName = job.name;
      const event = job.data;
      console.log("received an job with name:", eventName);
      console.log("received an job with data:", event);
      const handlers = handlersMap.get(eventName) ?? [];
      for (const handler of handlers) {
        await handler.handle(event);
      }
    },
    {
      connection: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
      concurrency: 10,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[DomainEventsWorker] Job ${job.id} for ${job.name} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[DomainEventsWorker] Job ${job?.id} for ${job?.name} failed:`,
      err
    );
  });

  console.log("[DomainEventsWorker] Listening for jobs...");
}

bootstrapWorker().catch((err) => {
  console.error("Worker bootstrap failed", err);
  process.exit(1);
});
