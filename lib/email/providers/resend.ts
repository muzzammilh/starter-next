/**
 * Resend email provider
 * Simple API-based email service popular with Next.js developers
 */

import type { EmailConfig, EmailResult, SendEmailOptions } from '../types';
import { logger } from '@/lib/logger';

export async function sendViaResend(
  options: SendEmailOptions,
  config: EmailConfig
): Promise<EmailResult> {
  const emailLogger = logger.child({ provider: 'resend', to: options.to });

  if (!config.apiKey) {
    emailLogger.error('RESEND_API_KEY is not configured');
    return {
      success: false,
      error: 'RESEND_API_KEY environment variable is required',
    };
  }

  try {
    const apiUrl = process.env.RESEND_API_URL;
    
    if (!apiUrl) {
      emailLogger.error('RESEND_API_URL is not configured');
      return {
        success: false,
        error: 'RESEND_API_URL environment variable is required',
      };
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      emailLogger.error({ error: data }, 'Failed to send email via Resend');
      return {
        success: false,
        error: data.message || 'Failed to send email',
      };
    }

    emailLogger.info({ messageId: data.id }, 'Email sent via Resend');

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    emailLogger.error({ error }, 'Failed to send email via Resend');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
