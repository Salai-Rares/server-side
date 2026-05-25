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
import { IEmailEventHandler } from "@/core/application/ports/events/outbox/handlers/email-event.handler.interface";
import { EmailEvent } from "@/core/application/email/events/emal.event.interface";
dotenv.config();
async function bootstrapEmailWorker() {
  const container: Container = buildWorkerContainer();
  container.load(eventsModule);
  const allHandlers = container.getAll<IEmailEventHandler>(
    EVENTS_SYMBOLS.EmailEventHandler
  );

  const handlersMap = new Map<string, IEmailEventHandler[]>();
  for (const handler of allHandlers) {
    const list = handlersMap.get(handler.eventName) ?? [];
    list.push(handler);
    handlersMap.set(handler.eventName, list);
    console.log(`Registered email handler for eventName=${handler.eventName}`);
  }

  const worker = new Worker<EmailEvent<string>>(
    QUEUE_NAMES.email_queue,
    async (job: Job<EmailEvent<string>>) => {
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
    console.log(`[EmailEventsWorker] Job ${job.id} for ${job.name} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[EmailEventsWorker] Job ${job?.id} for ${job?.name} failed:`,
      err
    );
  });

  console.log("[EmailEventsWorker] Listening for jobs...");
}

bootstrapEmailWorker().catch((err) => {
  console.error("Worker bootstrap failed", err);
  process.exit(1);
});
