
export type SendEmailParams = { 
  to: string;
  subject: string;
  htmlBody:string;
  textBody?: string;
}

export interface IEmailService {
  sendEmail(params: SendEmailParams): Promise<void>;
}
