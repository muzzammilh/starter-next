/**
 * Development email provider
 * Logs emails to console instead of sending them
 * Perfect for local development without email configuration
 */

import type { EmailResult, SendEmailOptions } from '../types';
import { logger } from '@/lib/logger';

export async function sendViaDev(
  options: SendEmailOptions
): Promise<EmailResult> {
  const emailLogger = logger.child({ provider: 'dev', to: options.to });

  // Log email details to console
  emailLogger.info(
    {
      to: options.to,
      subject: options.subject,
      hasHtml: !!options.html,
      hasText: !!options.text,
    },
    '📧 [DEV MODE] Email would be sent'
  );

  // Log email content in development
  if (process.env.NODE_ENV === 'development') {
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL (DEV MODE - NOT ACTUALLY SENT)');
    console.log('='.repeat(80));
    console.log(`To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    console.log(`Subject: ${options.subject}`);
    if (options.replyTo) {
      console.log(`Reply-To: ${options.replyTo}`);
    }
    console.log('-'.repeat(80));
    if (options.text) {
      console.log('TEXT VERSION:');
      console.log(options.text);
      console.log('-'.repeat(80));
    }
    if (options.html) {
      console.log('HTML VERSION:');
      console.log(options.html.substring(0, 500) + '...');
      console.log('-'.repeat(80));
    }
    console.log('='.repeat(80) + '\n');
  }

  return {
    success: true,
    messageId: `dev-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  };
}
