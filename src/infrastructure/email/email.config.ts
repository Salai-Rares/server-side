export type EmailConfig = {
  postmarkApiKey: string;
  fromEmail: string;
  messageStream: string;
  appBaseUrl: string;
};

const isProd = process.env.NODE_ENV === "production";

export const emailConfig: EmailConfig = {
  postmarkApiKey: process.env.POSTMARK_API_TOKEN ?? "",
  fromEmail: process.env.EMAIL_FROM ?? "contact@horasal.ro",
  messageStream: isProd ? "outbound" : "dev",
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:4200",
};
