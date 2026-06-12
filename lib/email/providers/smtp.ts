/**
 * SMTP email provider
 * Works with Gmail, Outlook, or any SMTP server
 */

import nodemailer from 'nodemailer';
import type { EmailConfig, EmailResult, SendEmailOptions } from '../types';
import { logger } from '@/lib/logger';

export async function sendViaSMTP(
  options: SendEmailOptions,
  config: EmailConfig
): Promise<EmailResult> {
  if (!config.smtp) {
    return {
      success: false,
      error: 'SMTP configuration is missing',
    };
  }

  const emailLogger = logger.child({ provider: 'smtp', to: options.to });

  try {
    // Create transporter
    const transporter = nodemailer.createTransport(config.smtp);

    // Verify connection
    await transporter.verify();
    emailLogger.debug('SMTP connection verified');

    // Send email
    const info = await transporter.sendMail({
      from: config.from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    emailLogger.info({ messageId: info.messageId }, 'Email sent via SMTP');

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    emailLogger.error({ error }, 'Failed to send email via SMTP');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
