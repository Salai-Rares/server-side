export const EVENTS_SYMBOLS = {
 
  EventBus: Symbol.for("EventBus"),
  DomainEventsQueue : Symbol.for("DomainEventsQueue"),
  DomainEventPublisher : Symbol.for("DomainEventPublisher"),
 
  DomainEventHandler :Symbol.for("DomainEventHandler"),
  EmailQueue:Symbol.for("EmailQueue"),
  EmailEventHandler : Symbol.for("EmailEventHandler")
};
