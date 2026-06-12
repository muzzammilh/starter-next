/**
 * Email verification template
 * Sent when user needs to verify their email address
 */

import type { EmailTemplate } from '../types';

interface VerifyEmailData {
  name?: string;
  email: string;
  verificationUrl: string;
  appName: string;
  expiresIn?: string;
}

export function verifyEmail(data: VerifyEmailData): EmailTemplate {
  const { name, email, verificationUrl, appName, expiresIn = '24 hours' } = data;
  const displayName = name || email.split('@')[0];

  return {
    subject: `Verify your email for ${appName}`,
    
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${displayName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thanks for signing up for ${appName}! To complete your registration, please verify your email address.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Click the button below to verify your email:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 14px; color: #667eea; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 30px; border-radius: 4px;">
              <p style="font-size: 14px; color: #92400e; margin: 0;">
                <strong>⏰ This link expires in ${expiresIn}.</strong><br>
                If you didn't create an account, you can safely ignore this email.
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
Verify Your Email

Hi ${displayName},

Thanks for signing up for ${appName}! To complete your registration, please verify your email address.

Verify your email by clicking this link:
${verificationUrl}

⏰ This link expires in ${expiresIn}.

If you didn't create an account, you can safely ignore this email.

Best regards,
The ${appName} Team

© ${new Date().getFullYear()} ${appName}. All rights reserved.
    `.trim(),
  };
}
