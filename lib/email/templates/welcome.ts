/**
 * Welcome email template
 * Sent when a new user signs up
 */

import type { EmailTemplate } from '../types';

interface WelcomeEmailData {
  name?: string;
  email: string;
  appName: string;
  appUrl: string;
}

export function welcomeEmail(data: WelcomeEmailData): EmailTemplate {
  const { name, email, appName, appUrl } = data;
  const displayName = name || email.split('@')[0];

  return {
    subject: `Welcome to ${appName}!`,
    
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${appName}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${appName}!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${displayName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thanks for signing up! We're excited to have you on board.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Your account has been created successfully. You can now access all features and start exploring.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Get Started
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              If you have any questions, feel free to reply to this email or visit our help center.
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
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
Welcome to ${appName}!

Hi ${displayName},

Thanks for signing up! We're excited to have you on board.

Your account has been created successfully. You can now access all features and start exploring.

Get started: ${appUrl}/dashboard

If you have any questions, feel free to reply to this email or visit our help center.

Best regards,
The ${appName} Team

© ${new Date().getFullYear()} ${appName}. All rights reserved.
Visit: ${appUrl}
    `.trim(),
  };
}
