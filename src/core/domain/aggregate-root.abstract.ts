import { DomainEvent } from "./events/domain-event.interface";

export abstract class AggregateRoot {
  private domainEvents: DomainEvent<string, unknown>[] = [];
  protected addDomainEvent(event: DomainEvent<string, unknown>): void {
    this.domainEvents.push(event);
  }
  public pullDomainEvents(): DomainEvent<string, unknown>[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
