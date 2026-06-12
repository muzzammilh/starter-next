/**
 * Email service
 * 
 * Unified email sending interface that works with multiple providers.
 * Auto-detects provider based on environment variables.
 * 
 * Usage:
 * ```typescript
 * import { sendEmail } from '@/lib/email';
 * 
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   template: 'welcome',
 *   data: { name: 'John', appName: 'MyApp', appUrl: 'https://myapp.com' }
 * });
 * ```
 */

import type { SendEmailOptions, EmailResult } from './types';
import { getEmailConfig } from './config';
import { sendViaSMTP } from './providers/smtp';
import { sendViaResend } from './providers/resend';
import { sendViaSendGrid } from './providers/sendgrid';
import { sendViaMailjet } from './providers/mailjet';
import { sendViaDev } from './providers/dev';
import { welcomeEmail } from './templates/welcome';
import { verifyEmail } from './templates/verify-email';
import { passwordResetEmail } from './templates/password-reset';
import { notificationEmail } from './templates/notification';
import { logger } from '@/lib/logger';

/**
 * Send an email using the configured provider
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<EmailResult> {
  const emailLogger = logger.child({ 
    to: options.to, 
    subject: options.subject,
    template: options.template 
  });

  try {
    // Get email configuration
    const config = getEmailConfig();
    emailLogger.debug({ provider: config.provider }, 'Sending email');

    // If template is specified, render it
    if (options.template && options.data) {
      const rendered = renderTemplate(options.template, options.data);
      if (!rendered) {
        emailLogger.error({ template: options.template }, 'Unknown email template');
        return {
          success: false,
          error: `Unknown template: ${options.template}`,
        };
      }
      options.subject = rendered.subject;
      options.html = rendered.html;
      options.text = rendered.text;
    }

    // Validate email options
    if (!options.subject) {
      emailLogger.error('Email must have a subject');
      return {
        success: false,
        error: 'Email must have a subject',
      };
    }
    
    if (!options.html && !options.text) {
      emailLogger.error('Email must have html or text content');
      return {
        success: false,
        error: 'Email must have html or text content',
      };
    }

    // Send via appropriate provider
    let result: EmailResult;

    switch (config.provider) {
      case 'smtp':
        result = await sendViaSMTP(options, config);
        break;
      case 'resend':
        result = await sendViaResend(options, config);
        break;
      case 'sendgrid':
        result = await sendViaSendGrid(options, config);
        break;
      case 'mailjet':
        result = await sendViaMailjet(options, config);
        break;
      case 'dev':
        result = await sendViaDev(options);
        break;
      default:
        result = {
          success: false,
          error: `Unknown provider: ${config.provider}`,
        };
    }

    if (result.success) {
      emailLogger.info({ messageId: result.messageId }, 'Email sent successfully');
    } else {
      emailLogger.error({ error: result.error }, 'Failed to send email');
    }

    return result;
  } catch (error) {
    emailLogger.error({ error }, 'Unexpected error sending email');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Render an email template with data
 */
function renderTemplate(
  template: string,
  data: Record<string, any>
) {
  switch (template) {
    case 'welcome':
      return welcomeEmail(data as any);
    case 'verify-email':
      return verifyEmail(data as any);
    case 'password-reset':
      return passwordResetEmail(data as any);
    case 'notification':
      return notificationEmail(data as any);
    default:
      return null;
  }
}

// Re-export types and utilities
export * from './types';
export { getEmailConfig, isEmailConfigured } from './config';
