/**
 * Test email endpoint
 * 
 * Use this to test your email configuration.
 * Disabled in production by default for security.
 * 
 * To enable in production, set: ENABLE_EMAIL_TEST_ENDPOINT="true"
 * 
 * Usage:
 * POST /api/email/test
 * Body: { "to": "test@example.com", "template": "welcome" }
 */

import { NextRequest } from 'next/server';
import { sendEmail } from '@/lib/email';
import { createLogger } from '@/lib/logger';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';

export async function POST(request: NextRequest) {
  const requestLogger = createLogger({
    endpoint: '/api/email/test',
    requestId: crypto.randomUUID(),
  });

  // Block in production unless explicitly enabled
  const isProduction = process.env.NODE_ENV === 'production';
  const isEnabled = process.env.ENABLE_EMAIL_TEST_ENDPOINT === 'true';

  if (isProduction && !isEnabled) {
    requestLogger.warn('Email test endpoint blocked in production');
    return apiError(
      'This endpoint is disabled in production',
      403,
      'ENDPOINT_DISABLED',
      { hint: 'Set ENABLE_EMAIL_TEST_ENDPOINT=true to enable' }
    );
  }

  try {
    const body = await request.json();
    const { to, template = 'welcome' } = body;

    if (!to) {
      return apiError('Email address is required', 400, 'MISSING_EMAIL');
    }

    requestLogger.info({ to, template }, 'Testing email');

    // Get app config
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Your App';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Prepare template data based on template type
    let data: Record<string, any> = {
      name: 'Test User',
      email: to,
      appName,
      appUrl,
    };

    if (template === 'verify-email') {
      data.verificationUrl = `${appUrl}/verify?token=test-token-123`;
    } else if (template === 'password-reset') {
      data.resetUrl = `${appUrl}/reset-password?token=test-token-123`;
    }

    // Send email
    const result = await sendEmail({
      to,
      template,
      data,
    });

    if (result.success) {
      requestLogger.info({ messageId: result.messageId }, 'Test email sent');
      return apiSuccess(
        { messageId: result.messageId },
        'Email sent successfully'
      );
    } else {
      requestLogger.error({ error: result.error }, 'Failed to send test email');
      return apiError(result.error || 'Failed to send email', 500, 'EMAIL_SEND_FAILED');
    }
  } catch (error) {
    requestLogger.error({ error }, 'Error in test email endpoint');
    return handleApiError(error);
  }
}
