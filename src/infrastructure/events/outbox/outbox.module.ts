import { IOutboxEventRepository } from "@/core/application/ports/events/outbox/repository/outbox-event.repository.interface";
import { OutboxEventRepository } from "@/infrastructure/events/outbox/repository/outbox-event.repository";
import { ContainerModule, interfaces } from "inversify";
import { OUTBOX_SYMBOLS } from "./outbox.symbols";

export const outboxModule = new ContainerModule((bind: interfaces.Bind) => {
  //   bind<IDomainEventPublisher>(EVENTS_SYMBOLS.DomainEventPublisher).to(
  //     BullMqDomainEventPublisher
  bind<IOutboxEventRepository>(OUTBOX_SYMBOLS.OutboxRepository)
    .to(OutboxEventRepository)
    .inSingletonScope();
});
