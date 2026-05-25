import { IEmailService } from "@/core/application/ports/email/email-service.interface";
import { ITokenService } from "@/core/application/ports/email/email-token-service.interface";
import { ContainerModule, interfaces } from "inversify";
import { EMAIL_SYMBOLS } from "./email.symbols";
import { EmailServiceAdapter } from "./services/email-adapter.service";
import { TokenService } from "@/core/application/services/token/confirmation-token.service";
import { emailConfig, EmailConfig } from "./email.config";
import { IEmailTemplateRenderer } from "@/core/application/ports/email/email-template-renderer.interface";
import { EmailTemplateRenderer } from "./templates/email-template-renderer.service";
import { ServerClient } from "postmark";

export const emailModule = new ContainerModule((bind: interfaces.Bind) => {
  const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN!);
  bind<ServerClient>(EMAIL_SYMBOLS.PostmarkSymbol).toConstantValue(
    postmarkClient,
  );
  bind<IEmailService>(EMAIL_SYMBOLS.EmailServiceAdapter)
    .to(EmailServiceAdapter)
    .inSingletonScope();
  bind<IEmailTemplateRenderer>(EMAIL_SYMBOLS.EmailTemplateRenderer)
    .to(EmailTemplateRenderer)
    .inSingletonScope();

  bind<EmailConfig>(EMAIL_SYMBOLS.EmailConfig).toConstantValue(emailConfig);
});
