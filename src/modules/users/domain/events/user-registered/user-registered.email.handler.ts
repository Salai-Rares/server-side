import { IEmailEventHandler } from "@/core/application/ports/events/outbox/handlers/email-event.handler.interface";
import { UserRegisteredDomainEvent } from "./user-registered.domain.interface";
import { DOMAIN_EVENT_NAMES } from "../events-names.constants";
import { inject, injectable } from "inversify";
import { UserRegisteredEmailConfirmationEvent } from "./user-registered.email.interface";
import { ITokenService } from "@/core/application/ports/email/email-token-service.interface";
import { TYPES } from "@/shared/types";
import { EMAIL_SYMBOLS } from "@/infrastructure/email/email.symbols";
import { IEmailService } from "@/core/application/ports/email/email-service.interface";
import { ConfirmationTokenType } from "@/core/application/ports/token/confirmation-token-kind.enum";
import { IEmailTemplateRenderer } from "@/core/application/ports/email/email-template-renderer.interface";
@injectable()
export class ConfirmationEmailHandler implements IEmailEventHandler<UserRegisteredEmailConfirmationEvent> {
    constructor(@inject(TYPES.ConfirmationTokenService) private tokenService: ITokenService, 
    @inject(EMAIL_SYMBOLS.EmailServiceAdapter) private emailService: IEmailService,
    @inject(EMAIL_SYMBOLS.EmailTemplateRenderer)
    private readonly templateRenderer: IEmailTemplateRenderer) {

    }
    eventName: string = DOMAIN_EVENT_NAMES.USER_REGISTERED;
    async handle(event: UserRegisteredEmailConfirmationEvent): Promise<void> {
      const destinationEmail : string = process.env.NODE_ENV === "production" ? event.payload.email : "test@blackhole.postmarkapp.com";
      const tokenType : ConfirmationTokenType = ConfirmationTokenType.EMAIL_VERIFICATION;
      const token = await this.tokenService.generateToken(event.payload.email,tokenType);
      let app_url;
      if(process.env.APP_BASE_URL) {
        app_url = process.env.APP_BASE_URL;
      }else {
        app_url = process.env.FRONTEND_RUNNING === "true" ? "http://localhost:4200" : "http://localhost:3000";
      }
      
      const confirmationUrl = `${app_url}/verify-email?token=${token}`;
       const htmlBody = await this.templateRenderer.render(
      "confirm-registration",
      {
        firstName: event.payload.firstName,
        confirmationUrl,
      }
    );
      await this.emailService.sendEmail({ to: destinationEmail, subject: "Confirmă adresa de email", htmlBody: htmlBody });
    }
    
}