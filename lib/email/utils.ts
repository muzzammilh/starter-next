/**
 * Email utility functions
 * Helper functions for common email operations
 */

import { sendEmail } from './index';
import type { EmailResult } from './types';

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<EmailResult> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Your App';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return sendEmail({
    to: email,
    template: 'welcome',
    data: {
      name,
      email,
      appName,
      appUrl,
    },
  });
}

/**
 * Send an email verification link
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
  name?: string
): Promise<EmailResult> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Your App';

  return sendEmail({
    to: email,
    template: 'verify-email',
    data: {
      name,
      email,
      verificationUrl,
      appName,
      expiresIn: '24 hours',
    },
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  name?: string
): Promise<EmailResult> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Your App';

  return sendEmail({
    to: email,
    template: 'password-reset',
    data: {
      name,
      email,
      resetUrl,
      appName,
      expiresIn: '1 hour',
    },
  });
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normalize email address (lowercase, trim)
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
