# Email System

This boilerplate includes a production-ready email system with support for multiple providers. Configure your preferred provider with explicit environment variables.

## Features

- 🚀 **Multiple Providers**: SMTP, Resend, SendGrid, Mailjet
- 🎨 **Beautiful Templates**: Pre-built HTML email templates
- 🔧 **Provider Detection**: Uses configured provider based on environment variables
- 🧪 **Dev Mode**: No configuration needed for local development
- 📝 **Type-Safe**: Full TypeScript support
- 🎯 **Simple API**: Clean, unified interface
- ⚙️ **Explicit Configuration**: All API endpoints must be explicitly set (no hidden defaults)

## Quick Start

The email system detects which provider to use based on your environment variables. **Only configure ONE provider** to avoid conflicts.

### Provider Priority
If multiple are configured:
1. Resend → 2. SendGrid → 3. Mailjet → 4. SMTP → 5. Dev mode

**Important**: API-based providers (Resend, SendGrid, Mailjet) require both API key AND API URL to be explicitly configured.

### Option 1: Dev Mode (No Setup Required)

By default, emails are logged to the console. Perfect for local development:

```typescript
import { sendWelcomeEmail } from '@/lib/email/utils';

await sendWelcomeEmail('user@example.com', 'John Doe');
// Email content will be logged to console
```

### Option 2: SMTP (Gmail, Outlook, etc.)

Use any SMTP server. For Gmail, create an [App Password](https://support.google.com/accounts/answer/185833):

```env
# .env.local
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="Your App <noreply@yourapp.com>"
```

### Option 3: Resend (Recommended)

Simple API-based service popular with Next.js developers:

```env
# .env.local
RESEND_API_KEY="re_123456789"
RESEND_API_URL="https://api.resend.com/emails"
EMAIL_FROM="Your App <noreply@yourapp.com>"
```

Get your API key at [resend.com](https://resend.com)

### Option 4: SendGrid

Enterprise-grade email service:

```env
# .env.local
SENDGRID_API_KEY="SG.123456789"
SENDGRID_API_URL="https://api.sendgrid.com/v3/mail/send"
EMAIL_FROM="Your App <noreply@yourapp.com>"
```

Get your API key at [sendgrid.com](https://sendgrid.com)

### Option 5: Mailjet

European email service with good deliverability:

```env
# .env.local
MAILJET_API_KEY="your-api-key"
MAILJET_API_SECRET="your-api-secret"
MAILJET_API_URL="https://api.mailjet.com/v3.1/send"
EMAIL_FROM="Your App <noreply@yourapp.com>"
```

Get your credentials at [mailjet.com](https://mailjet.com)

## Usage Examples

### Send Welcome Email

```typescript
import { sendWelcomeEmail } from '@/lib/email/utils';

// In a Server Action or API route
await sendWelcomeEmail('user@example.com', 'John Doe');
```

### Send Email Verification

```typescript
import { sendVerificationEmail } from '@/lib/email/utils';

const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;
await sendVerificationEmail('user@example.com', verificationUrl, 'John Doe');
```

### Send Password Reset

```typescript
import { sendPasswordResetEmail } from '@/lib/email/utils';

const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
await sendPasswordResetEmail('user@example.com', resetUrl, 'John Doe');
```

### Custom Email

```typescript
import { sendEmail } from '@/lib/email';

await sendEmail({
  to: 'user@example.com',
  subject: 'Custom Email',
  html: '<h1>Hello!</h1><p>This is a custom email.</p>',
  text: 'Hello! This is a custom email.',
});
```

### Using Templates

```typescript
import { sendEmail } from '@/lib/email';

await sendEmail({
  to: 'user@example.com',
  template: 'welcome',
  data: {
    name: 'John Doe',
    email: 'user@example.com',
    appName: process.env.NEXT_PUBLIC_APP_NAME,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

## In Server Actions

```typescript
'use server';

import { sendWelcomeEmail } from '@/lib/email/utils';
import { prisma } from '@/lib/db';

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  
  // Create user
  const user = await prisma.user.create({
    data: { email, name }
  });
  
  // Send welcome email
  await sendWelcomeEmail(email, name);
  
  return { success: true };
}
```

## In API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const { email, name } = await request.json();
  
  const result = await sendEmail({
    to: email,
    template: 'welcome',
    data: {
      email,
      name,
      appName: process.env.NEXT_PUBLIC_APP_NAME,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    },
  });
  
  if (result.success) {
    return NextResponse.json({ success: true, messageId: result.messageId });
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}
```

## Available Templates

The boilerplate includes three pre-built email templates:

### 1. Welcome Email (`welcome`)
- Sent when a new user signs up
- Includes a "Get Started" button
- Data: `{ name, email, appName, appUrl }`

### 2. Email Verification (`verify-email`)
- Sent to verify user's email address
- Includes verification link with expiration notice
- Data: `{ name, email, verificationUrl, appName, expiresIn }`

### 3. Password Reset (`password-reset`)
- Sent when user requests password reset
- Includes reset link with security warnings
- Data: `{ name, email, resetUrl, appName, expiresIn }`

## Creating Custom Templates

Add new templates in `lib/email/templates/`:

```typescript
// lib/email/templates/notification.ts
import type { EmailTemplate } from '../types';

interface NotificationData {
  name: string;
  message: string;
  appName: string;
}

export function notificationEmail(data: NotificationData): EmailTemplate {
  const { name, message, appName } = data;

  return {
    subject: `New notification from ${appName}`,
    html: `
      <h1>Hi ${name}!</h1>
      <p>${message}</p>
    `,
    text: `Hi ${name}!\n\n${message}`,
  };
}
```

Then update the template renderer:

```typescript
import { notificationEmail } from './templates/notification';

function renderTemplate(template: string, data: Record<string, any>) {
  switch (template) {
    case 'welcome':
      return welcomeEmail(data);
    case 'notification':
      return notificationEmail(data);
    // ... other templates
  }
}
```

## Testing Your Email Setup

### 1. Using the Test Endpoint

The `/api/email/test` endpoint is available for testing your email configuration.

⚠️ **Security Note**: This endpoint is automatically disabled in production. To enable it in production (not recommended), set:
```env
ENABLE_EMAIL_TEST_ENDPOINT="true"
```

```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "template": "welcome"}'
```

### 2. In Your Code

```typescript
import { sendEmail } from '@/lib/email';

const result = await sendEmail({
  to: 'test@example.com',
  template: 'welcome',
  data: {
    name: 'Test User',
    email: 'test@example.com',
    appName: 'MyApp',
    appUrl: 'http://localhost:3000',
  },
});

console.log(result); // { success: true, messageId: '...' }
```

### 3. Check Logs

All email operations are logged with Pino:

```
{"level":"info","provider":"resend","to":"user@example.com","messageId":"abc123","msg":"Email sent successfully"}
```

## Provider-Specific Setup

### Gmail SMTP
1. Enable 2-factor authentication on your Google account
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Use the app password in `EMAIL_PASSWORD`
4. Note: Gmail has sending limits (500/day for free accounts)

### Resend
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain)
3. Create an API key
4. Add to `.env.local` as `RESEND_API_KEY`

### SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your sender identity
3. Create an API key with "Mail Send" permissions
4. Add to `.env.local` as `SENDGRID_API_KEY`

### Mailjet
1. Sign up at [mailjet.com](https://mailjet.com)
2. Verify your sender domain
3. Get API key and secret from account settings
4. Add both to `.env.local`

## Production Checklist

- [ ] Choose and configure an email provider
- [ ] Verify your sending domain
- [ ] Set `EMAIL_FROM` to a real email address
- [ ] Test all email templates
- [ ] Ensure `ENABLE_EMAIL_TEST_ENDPOINT` is not set (test endpoint auto-disabled in production)
- [ ] Set up email monitoring/alerts
- [ ] Configure SPF, DKIM, and DMARC records
- [ ] Test spam score of your emails
- [ ] Set up bounce and complaint handling

## Troubleshooting

### Emails not sending
- Check environment variables are set correctly
- Verify API keys are valid
- Check logs for error messages
- Test with the `/api/email/test` endpoint

### Emails going to spam
- Verify your sending domain
- Set up SPF, DKIM, and DMARC records
- Use a professional email address in `EMAIL_FROM`
- Avoid spam trigger words in subject/content

### SMTP connection errors
- Verify host and port are correct
- Check if your provider requires SSL (`EMAIL_SECURE="true"`)
- Ensure firewall allows outbound SMTP connections
- For Gmail, use an App Password, not your regular password

### Rate limiting
- Gmail: 500 emails/day (free), 2000/day (Workspace)
- Resend: 100 emails/day (free), more on paid plans
- SendGrid: 100 emails/day (free), more on paid plans
- Mailjet: 200 emails/day (free), more on paid plans

### API endpoint not configured
- Ensure you've set both the API key AND API URL for your provider
- Check `.env.example` for the correct endpoint URLs
- All API endpoints must be explicitly configured (no defaults)
- Error will be logged: `"*_API_URL is not configured"`

## Best Practices

1. **Always use templates** for consistent branding
2. **Include both HTML and text versions** for better deliverability
3. **Log all email operations** for debugging and monitoring
4. **Handle failures gracefully** - don't block user actions on email failures
5. **Use a queue** for bulk emails (consider adding a job queue like BullMQ)
6. **Test emails** before deploying to production
7. **Monitor bounce rates** and remove invalid addresses
8. **Respect unsubscribe requests** (add unsubscribe links to marketing emails)

## Email Utilities

The boilerplate includes helpful utility functions:

```typescript
import { isValidEmail, normalizeEmail } from '@/lib/email/utils';

// Validate email format
if (!isValidEmail(email)) {
  throw new Error('Invalid email address');
}

// Normalize email (lowercase, trim)
const normalized = normalizeEmail(' User@Example.COM ');
// Result: 'user@example.com'
```

## Integration with Authentication

Example: Send verification email on signup:

```typescript
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email/utils';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  const { email, name } = await request.json();
  
  // Create user
  const user = await prisma.user.create({
    data: { email, name }
  });
  
  // Generate verification token
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });
  
  // Send verification email
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;
  await sendVerificationEmail(email, verificationUrl, name);
  
  return NextResponse.json({ success: true });
}
```
