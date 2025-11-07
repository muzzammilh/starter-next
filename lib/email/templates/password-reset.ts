/**
 * Password reset email template
 * Sent when user requests a password reset
 */

import type { EmailTemplate } from '../types';

interface PasswordResetData {
  name?: string;
  email: string;
  resetUrl: string;
  appName: string;
  expiresIn?: string;
}

export function passwordResetEmail(data: PasswordResetData): EmailTemplate {
  const { name, email, resetUrl, appName, expiresIn = '1 hour' } = data;
  const displayName = name || email.split('@')[0];

  return {
    subject: `Reset your password for ${appName}`,
    
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${displayName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password for your ${appName} account.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 14px; color: #667eea; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin-top: 30px; border-radius: 4px;">
              <p style="font-size: 14px; color: #991b1b; margin: 0;">
                <strong>⏰ This link expires in ${expiresIn}.</strong><br>
                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              Best regards,<br>
              The ${appName} Team
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    
    text: `
Reset Your Password

Hi ${displayName},

We received a request to reset your password for your ${appName} account.

Reset your password by clicking this link:
${resetUrl}

⏰ This link expires in ${expiresIn}.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The ${appName} Team

© ${new Date().getFullYear()} ${appName}. All rights reserved.
    `.trim(),
  };
}
