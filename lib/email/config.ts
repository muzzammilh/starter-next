/**
 * Email configuration
 * 
 * Auto-detects email provider based on environment variables.
 * Supports SMTP, Resend, SendGrid, Mailjet, and dev mode.
 * 
 * Priority order (if multiple providers are configured):
 * 1. Resend (RESEND_API_KEY)
 * 2. SendGrid (SENDGRID_API_KEY)
 * 3. Mailjet (MAILJET_API_KEY + MAILJET_API_SECRET)
 * 4. SMTP (EMAIL_HOST + EMAIL_USER + EMAIL_PASSWORD)
 * 5. Dev mode (no config - logs to console)
 * 
 * To use a specific provider, only set that provider's credentials.
 */

import type { EmailConfig, EmailProvider } from './types';

/**
 * Detect which email provider to use based on environment variables
 * 
 * Priority: Resend > SendGrid > Mailjet > SMTP > Dev mode
 */
function detectProvider(): EmailProvider {
  // API-based providers (checked first for simplicity)
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SENDGRID_API_KEY) return 'sendgrid';
  if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) return 'mailjet';
  
  // SMTP configuration
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return 'smtp';
  }
  
  // Default to dev mode (logs to console)
  return 'dev';
}

/**
 * Get email configuration based on environment variables
 */
export function getEmailConfig(): EmailConfig {
  const provider = detectProvider();
  const from = process.env.EMAIL_FROM
    || (process.env.NEXT_PUBLIC_APP_NAME 
      ? `${process.env.NEXT_PUBLIC_APP_NAME} <noreply@example.com>` 
      : 'noreply@example.com');

  const config: EmailConfig = {
    provider,
    from,
  };

  switch (provider) {
    case 'smtp':
      config.smtp = {
        host: process.env.EMAIL_HOST!,
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER!,
          pass: process.env.EMAIL_PASSWORD!,
        },
      };
      break;

    case 'resend':
      config.apiKey = process.env.RESEND_API_KEY!;
      break;

    case 'sendgrid':
      config.apiKey = process.env.SENDGRID_API_KEY!;
      break;

    case 'mailjet':
      config.mailjet = {
        apiKey: process.env.MAILJET_API_KEY!,
        apiSecret: process.env.MAILJET_API_SECRET!,
      };
      break;

    case 'dev':
      // No additional config needed for dev mode
      break;
  }

  return config;
}

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  const provider = detectProvider();
  return provider !== 'dev';
}
