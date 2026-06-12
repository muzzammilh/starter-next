/**
 * Generic notification email template
 * Use this as a foundation for custom notifications
 */

import type { EmailTemplate } from '../types';

interface NotificationData {
  name?: string;
  email: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  appName: string;
  appUrl: string;
}

export function notificationEmail(data: NotificationData): EmailTemplate {
  const { name, email, title, message, actionUrl, actionText, appName, appUrl } = data;
  const displayName = name || email.split('@')[0];

  return {
    subject: title,
    
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${title}</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${displayName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px; white-space: pre-line;">
              ${message}
            </p>
            
            ${actionUrl && actionText ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  ${actionText}
                </a>
              </div>
            ` : ''}
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              Best regards,<br>
              The ${appName} Team
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            <p style="margin-top: 10px;">
              <a href="${appUrl}" style="color: #667eea; text-decoration: none;">Visit Website</a>
            </p>
          </div>
        </body>
      </html>
    `,
    
    text: `
${title}

Hi ${displayName},

${message}

${actionUrl && actionText ? `${actionText}: ${actionUrl}\n` : ''}

Best regards,
The ${appName} Team

© ${new Date().getFullYear()} ${appName}. All rights reserved.
Visit: ${appUrl}
    `.trim(),
  };
}
