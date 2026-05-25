import { IOutboxDispatcherEvents } from "@/core/application/ports/events/outbox/events-dispatcher.interface";
import { DomainOutboxDispatcher } from "@/infrastructure/events/outbox/dispatchers/domain-outbox.dispatcher";
import { interfaces } from "inversify";
import { ContainerModule } from "inversify";
import { OUTBOX_DISPATCHERS_SYMBOLS } from "./dispatchers.symbols";

export const outboxDispatchersModule = new ContainerModule((bind: interfaces.Bind) => {

    bind<IOutboxDispatcherEvents>(OUTBOX_DISPATCHERS_SYMBOLS.AllOutboxDispatchers).to(DomainOutboxDispatcher).inSingletonScope()
})