import { injectable, inject } from "inversify";
import { IEmailEventHandler } from "@/core/application/ports/events/outbox/handlers/email-event.handler.interface";
import { DOMAIN_EVENT_NAMES } from "../events-names.constants";
import { PasswordResetEmailEvent } from "./password-reset-requested.email.interface";
import { ITokenService } from "@/core/application/ports/email/email-token-service.interface";
import { IEmailService } from "@/core/application/ports/email/email-service.interface";
import { IEmailTemplateRenderer } from "@/core/application/ports/email/email-template-renderer.interface";
import { ConfirmationTokenType } from "@/core/application/ports/token/confirmation-token-kind.enum";
import { TYPES } from "@/shared/types";
import { EMAIL_SYMBOLS } from "@/infrastructure/email/email.symbols";

const PASSWORD_RESET_TTL_SECONDS = 15 * 60; // 15 minutes

@injectable()
export class PasswordResetEmailHandler
  implements IEmailEventHandler<PasswordResetEmailEvent>
{
  eventName = DOMAIN_EVENT_NAMES.PASSWORD_RESET_REQUESTED;

  constructor(
    @inject(TYPES.ConfirmationTokenService) private tokenService: ITokenService,
    @inject(EMAIL_SYMBOLS.EmailServiceAdapter) private emailService: IEmailService,
    @inject(EMAIL_SYMBOLS.EmailTemplateRenderer) private templateRenderer: IEmailTemplateRenderer
  ) {}

  async handle(event: PasswordResetEmailEvent): Promise<void> {
    const destinationEmail =
      process.env.NODE_ENV === "production"
        ? event.payload.email
        : "test@blackhole.postmarkapp.com";

    const token = await this.tokenService.generateToken(
      event.payload.email,
      ConfirmationTokenType.PASSWORD_RESET,
      PASSWORD_RESET_TTL_SECONDS
    );

    const appUrl = process.env.APP_BASE_URL
      ?? (process.env.FRONTEND_RUNNING === "true" ? "http://localhost:4200" : "http://localhost:3000");

    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const htmlBody = await this.templateRenderer.render("password-reset", {
      firstName: event.payload.firstName,
      resetUrl,
    });

    await this.emailService.sendEmail({
      to: destinationEmail,
      subject: "Resetează parola",
      htmlBody,
    });
  }
}
