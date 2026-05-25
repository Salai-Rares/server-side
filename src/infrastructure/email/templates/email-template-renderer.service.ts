// src/infrastructure/email/templates/template-renderer.service.ts

import fs from "fs/promises";
import path from "path";
import mjml2html from "mjml";
import Handlebars from "handlebars";
import { injectable } from "inversify";
import { IEmailTemplateRenderer } from "@/core/application/ports/email/email-template-renderer.interface";

type TemplateVariables = Record<string, string | number | boolean>;

@injectable()
export class EmailTemplateRenderer implements IEmailTemplateRenderer {
  private readonly compiledTemplates = new Map<string, Handlebars.TemplateDelegate>();

  async render(templateName: string, variables: TemplateVariables): Promise<string> {
    const compiledTemplate = await this.getCompiledTemplate(templateName);

    const mjml = compiledTemplate(variables);

    const { html, errors } = await mjml2html(mjml, {
      validationLevel: "strict",
    });

    if (errors.length > 0) {
      throw new Error(
        `MJML template "${templateName}" is invalid: ${errors
          .map((err:any) => err.formattedMessage)
          .join("\n")}`
      );
    }

    return html;
  }

  private async getCompiledTemplate(
    templateName: string
  ): Promise<Handlebars.TemplateDelegate> {
    const cached = this.compiledTemplates.get(templateName);

    if (cached) {
      return cached;
    }

    const templatePath = path.resolve(
      process.cwd(),
      "src",
      "infrastructure",
      "email",
      "templates",
      `${templateName}.mjml`
    );

    const templateContent = await fs.readFile(templatePath, "utf-8");
    const compiled = Handlebars.compile(templateContent);

    this.compiledTemplates.set(templateName, compiled);

    return compiled;
  }
}