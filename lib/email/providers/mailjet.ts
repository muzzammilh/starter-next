/**
 * Mailjet email provider
 * European email service with good deliverability
 */

import type { EmailConfig, EmailResult, SendEmailOptions } from '../types';
import { logger } from '@/lib/logger';

export async function sendViaMailjet(
  options: SendEmailOptions,
  config: EmailConfig
): Promise<EmailResult> {
  const emailLogger = logger.child({ provider: 'mailjet', to: options.to });

  if (!config.mailjet) {
    emailLogger.error('MAILJET_API_KEY or MAILJET_API_SECRET is not configured');
    return {
      success: false,
      error: 'MAILJET_API_KEY and MAILJET_API_SECRET environment variables are required',
    };
  }

  try {
    const apiUrl = process.env.MAILJET_API_URL;
    
    if (!apiUrl) {
      emailLogger.error('MAILJET_API_URL is not configured');
      return {
        success: false,
        error: 'MAILJET_API_URL environment variable is required',
      };
    }
    
    const auth = Buffer.from(
      `${config.mailjet.apiKey}:${config.mailjet.apiSecret}`
    ).toString('base64');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: config.from.includes('<')
                ? config.from.match(/<(.+)>/)?.[1] || config.from
                : config.from,
              Name: config.from.includes('<')
                ? config.from.split('<')[0].trim()
                : undefined,
            },
            To: Array.isArray(options.to)
              ? options.to.map(email => ({ Email: email }))
              : [{ Email: options.to }],
            Subject: options.subject,
            TextPart: options.text,
            HTMLPart: options.html,
            ReplyTo: options.replyTo ? { Email: options.replyTo } : undefined,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      emailLogger.error({ error: data }, 'Failed to send email via Mailjet');
      return {
        success: false,
        error: data.ErrorMessage || 'Failed to send email',
      };
    }

    const messageId = data.Messages?.[0]?.To?.[0]?.MessageID?.toString();
    emailLogger.info({ messageId }, 'Email sent via Mailjet');

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    emailLogger.error({ error }, 'Failed to send email via Mailjet');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
