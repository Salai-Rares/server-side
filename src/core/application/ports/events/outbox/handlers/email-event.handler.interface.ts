import { EmailEvent } from "@/core/application/email/events/emal.event.interface";


export interface IEmailEventHandler<
  T extends EmailEvent<string, unknown> = EmailEvent<string, unknown>
> {
  eventName: string;
  handle(event: T): Promise<void>;
}
