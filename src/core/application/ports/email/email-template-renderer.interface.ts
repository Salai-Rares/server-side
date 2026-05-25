// src/core/application/ports/email/email-template-renderer.interface.ts

export interface IEmailTemplateRenderer {
  render(
    templateName: string,
    variables: Record<string, string | number | boolean>
  ): Promise<string>;
}