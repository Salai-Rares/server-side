import { ContainerModule, interfaces } from "inversify";
import { EVENTS_SYMBOLS } from "./events.symbols";

import { Queue } from "bullmq";
import { IDomainEventPublisher } from "@/core/application/ports/events/outbox/publishers/domain-event-publisher.interface";
import { BullMqDomainEventPublisher } from "@/infrastructure/events/publishers/domain/bullmq-domain-event-publisher";
import { QUEUE_NAMES } from "@/core/application/events/events.constants";

export const eventsModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<IDomainEventPublisher>(EVENTS_SYMBOLS.DomainEventPublisher).to(
    BullMqDomainEventPublisher
  ).inSingletonScope();
  
  bind<Queue>(EVENTS_SYMBOLS.DomainEventsQueue)
    .toDynamicValue(() => {
      return new Queue(QUEUE_NAMES.domain_queue, {
        connection: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        },
      });
    })
    .inSingletonScope();
  bind<Queue>(EVENTS_SYMBOLS.EmailQueue).toDynamicValue(() => {
    return new Queue(QUEUE_NAMES.email_queue, {
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });
  });
});
