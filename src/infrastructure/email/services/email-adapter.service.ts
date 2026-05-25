import {
  IEmailService,
  SendEmailParams,
} from "@/core/application/ports/email/email-service.interface";
import { inject, injectable } from "inversify";
import { ServerClient } from "postmark";
import { EmailConfig } from "../email.config";
import { EMAIL_SYMBOLS } from "../email.symbols";
import { convert } from "html-to-text";
import { TYPES } from "@/shared/types";
@injectable()
export class EmailServiceAdapter implements IEmailService {
  constructor(
    @inject(EMAIL_SYMBOLS.EmailConfig) private cfg: EmailConfig,
    @inject(EMAIL_SYMBOLS.PostmarkSymbol) private client: ServerClient,
  ) {}
  async sendEmail(params: SendEmailParams): Promise<void> {
    try {
      const text = params.textBody ?? convert(params.htmlBody);
      await this.client.sendEmail({
        From: this.cfg.fromEmail,
        To: params.to,
        Subject: params.subject,
        HtmlBody: params.htmlBody,
        TextBody: text,
        MessageStream: this.cfg.messageStream,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
  async sendEmailConfirmation(email: string, token: string): Promise<void> {
    setTimeout(() => {
      console.log(
        `Email confirmation sent after 1 second to ${email} and token is ${token}`,
      );
    }, 1000);
  }
}
