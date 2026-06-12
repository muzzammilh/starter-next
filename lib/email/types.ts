/**
 * Email system type definitions
 */

export type EmailProvider = 'smtp' | 'resend' | 'sendgrid' | 'mailjet' | 'dev';

export interface EmailConfig {
  provider: EmailProvider;
  from: string;
  
  // SMTP config
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  
  // API-based providers
  apiKey?: string;
  
  // Mailjet specific (uses two keys)
  mailjet?: {
    apiKey: string;
    apiSecret: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  template?: string;
  data?: Record<string, any>;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
