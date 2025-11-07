/**
 * SendGrid email provider
 * Enterprise-grade email service
 */

import type { EmailConfig, EmailResult, SendEmailOptions } from '../types';
import { logger } from '@/lib/logger';

export async function sendViaSendGrid(
  options: SendEmailOptions,
  config: EmailConfig
): Promise<EmailResult> {
  const emailLogger = logger.child({ provider: 'sendgrid', to: options.to });

  if (!config.apiKey) {
    emailLogger.error('SENDGRID_API_KEY is not configured');
    return {
      success: false,
      error: 'SENDGRID_API_KEY environment variable is required',
    };
  }

  try {
    const apiUrl = process.env.SENDGRID_API_URL;
    
    if (!apiUrl) {
      emailLogger.error('SENDGRID_API_URL is not configured');
      return {
        success: false,
        error: 'SENDGRID_API_URL environment variable is required',
      };
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(options.to)
              ? options.to.map(email => ({ email }))
              : [{ email: options.to }],
          },
        ],
        from: {
          email: config.from.includes('<')
            ? config.from.match(/<(.+)>/)?.[1] || config.from
            : config.from,
          name: config.from.includes('<')
            ? config.from.split('<')[0].trim()
            : undefined,
        },
        subject: options.subject,
        content: [
          ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
          ...(options.html ? [{ type: 'text/html', value: options.html }] : []),
        ],
        reply_to: options.replyTo ? { email: options.replyTo } : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      emailLogger.error({ error }, 'Failed to send email via SendGrid');
      return {
        success: false,
        error: error || 'Failed to send email',
      };
    }

    // SendGrid returns 202 with X-Message-Id header
    const messageId = response.headers.get('X-Message-Id') || undefined;
    emailLogger.info({ messageId }, 'Email sent via SendGrid');

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    emailLogger.error({ error }, 'Failed to send email via SendGrid');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
