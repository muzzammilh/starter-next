# Logging

This boilerplate includes a simple, production-ready logging system optimized for **Vercel** and serverless platforms. The logger outputs structured JSON logs to stdout/stderr, which are automatically captured by your deployment platform.

## Overview

The logging system is built on standard `console` methods with structured JSON output:
- **Zero dependencies** - No Pino, no next-logger, no external logging libraries
- **Vercel-optimized** - Logs appear automatically in Vercel Dashboard
- **Structured JSON** - Easy parsing and integration with log aggregation tools
- **Serverless-friendly** - Works on Vercel, AWS Lambda, Netlify, Cloudflare, etc.
- **Fast** - No bundling issues, faster cold starts, smaller bundle size
- **Secure** - Automatic redaction of sensitive fields

## Features

- 🚀 **Zero Dependencies**: Built on standard Node.js console
- 📊 **Structured Logs**: JSON format for easy parsing
- 🔒 **Security**: Automatic redaction of sensitive fields (passwords, tokens, etc.)
- 🎯 **Contextual**: Child loggers for request-specific context
- ⚙️ **Configurable**: Environment-based log levels
- ☁️ **Serverless-Ready**: Perfect for Vercel, AWS Lambda, and other platforms

## Quick Start

### Basic Usage

```typescript
import { logger } from '@/lib/logger';

// Simple logging
logger.info('User logged in');
logger.error('Failed to process payment');
logger.debug('Debug information');
logger.warn('Deprecated API used');

// Structured logging with data
logger.info({ userId: '123', action: 'login' }, 'User logged in');
logger.error({ error: err.message, stack: err.stack }, 'Payment failed');
```

### In Server Components

```typescript
import { logger } from '@/lib/logger';

export default async function Page() {
  logger.info('Rendering page');

  try {
    const data = await fetchData();
    logger.debug({ dataCount: data.length }, 'Data fetched');
    return <div>{/* ... */}</div>;
  } catch (error) {
    logger.error({ error }, 'Failed to fetch data');
    throw error;
  }
}
```

### In API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  // Create request-specific logger with context
  const requestLogger = logger.child({
    requestId: crypto.randomUUID(),
    endpoint: '/api/users',
  });

  try {
    const body = await request.json();
    requestLogger.info({ userId: body.userId }, 'Creating user');

    // Your logic here

    requestLogger.info('User created successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    requestLogger.error({ error }, 'Failed to create user');
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### In Server Actions

```typescript
'use server';

import { logger } from '@/lib/logger';

export async function createUser(formData: FormData) {
  const actionLogger = logger.child({ action: 'createUser' });

  try {
    actionLogger.info('Processing form submission');
    // Your logic
    actionLogger.info('User created');
  } catch (error) {
    actionLogger.error({ error }, 'Action failed');
    throw error;
  }
}
```

## Configuration

### Log Levels

Set `LOG_LEVEL` in `.env.local` to control verbosity:

```env
# Options: trace, debug, info, warn, error, fatal
LOG_LEVEL="debug"  # Development (shows everything)
LOG_LEVEL="info"   # Production (recommended)
LOG_LEVEL="error"  # Only errors
```

**Log Levels Explained:**
- `trace` (10): Very detailed debugging
- `debug` (20): Debugging information
- `info` (30): General information (default in production)
- `warn` (40): Warning messages
- `error` (50): Error messages
- `fatal` (60): Fatal errors that crash the app

**Default Behavior:**
- Development: `debug` level (shows all logs except trace)
- Production: `info` level (shows info, warn, error, fatal)

## Child Loggers (Contextual Logging)

Create child loggers to add persistent context to all logs:

```typescript
import { createLogger } from '@/lib/logger';

// Create logger with context
const userLogger = createLogger({
  userId: '123',
  tenantId: 'abc'
});

userLogger.info('User action');
// Output: {"level":"info","time":"2025-11-20T08:00:00.000Z","userId":"123","tenantId":"abc","msg":"User action","name":"app"}

userLogger.error({ error: 'Failed' }, 'Operation failed');
// Context is automatically included in every log
```

## Security: Sensitive Data Redaction

The logger automatically redacts sensitive fields:

```typescript
logger.info({
  username: 'john',
  password: 'secret123',  // Will be redacted
  token: 'abc123'         // Will be redacted
});

// Output: {"level":"info","username":"john","password":"[REDACTED]","token":"[REDACTED]",...}
```

**Redacted fields by default:**
- `password`
- `token`
- `apiKey`
- `secret`
- `authorization`
- `passwordHash`
- `accessToken`
- `refreshToken`

**Add custom redaction:**

Edit `lib/logger.ts`:
```typescript
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'secret',
  'authorization',
  'ssn',          // Add custom fields
  'creditCard',   // Add custom fields
];
```

## Deployment & Viewing Logs

### Vercel

Logs automatically appear in:
- **Vercel Dashboard** → Your Project → Logs tab
- Real-time log streaming during function execution
- Searchable and filterable by function, status, time

No configuration needed - just deploy!

### Other Platforms

The logger works on all serverless platforms:
- **AWS Lambda**: Logs sent to CloudWatch Logs automatically
- **Netlify**: Logs appear in Functions → Function Logs
- **Google Cloud Functions**: Logs sent to Cloud Logging
- **Cloudflare Workers**: Logs appear in Cloudflare dashboard

## Log Format

All logs are structured JSON with the following format:

```json
{
  "level": "info",
  "time": "2025-11-20T08:00:00.000Z",
  "msg": "User logged in",
  "name": "app",
  "userId": "123",
  "action": "login"
}
```

**Fields:**
- `level`: Log level (trace, debug, info, warn, error, fatal)
- `time`: ISO 8601 timestamp
- `msg`: Log message
- `name`: Logger name (default: "app")
- Additional fields from context or log data

## Integration with Log Aggregation

The JSON format works seamlessly with popular log aggregation services:

### Datadog

```env
# Forward logs to Datadog via HTTP intake
# Use Vercel integration or custom forwarder
```

### Axiom

```env
# Axiom has built-in Vercel integration
# Just connect in Axiom dashboard
```

### LogFlare

```env
# LogFlare integrates with Vercel natively
# Configure in LogFlare dashboard
```

### Other Services

The structured JSON format works with:
- Elasticsearch / OpenSearch
- Splunk
- Grafana Loki
- CloudWatch (AWS)
- Logtail
- Better Stack

## Usage Examples

### Example 1: Database Operations

```typescript
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';

export async function getUser(id: string) {
  const dbLogger = logger.child({ operation: 'getUser', userId: id });

  try {
    dbLogger.debug('Querying database');
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      dbLogger.warn('User not found');
      return null;
    }

    dbLogger.info('User retrieved successfully');
    return user;
  } catch (error) {
    dbLogger.error({ error }, 'Database query failed');
    throw error;
  }
}
```

### Example 2: Authentication Flow

```typescript
import { logger } from '@/lib/logger';

export async function signIn(email: string, password: string) {
  const authLogger = logger.child({ email, flow: 'signIn' });

  authLogger.info('Sign-in attempt');

  const user = await findUser(email);
  if (!user) {
    authLogger.warn('User not found');
    return { error: 'Invalid credentials' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    authLogger.warn('Invalid password');
    return { error: 'Invalid credentials' };
  }

  authLogger.info('Sign-in successful');
  return { success: true };
}
```

### Example 3: Error Tracking

```typescript
import { logger } from '@/lib/logger';

try {
  await riskyOperation();
} catch (error) {
  logger.error({
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context: { userId: '123', operation: 'riskyOperation' }
  }, 'Operation failed');

  throw error;
}
```

## Best Practices

1. **Use structured logging**: Pass objects with data, not just strings
   ```typescript
   // ✅ Good
   logger.info({ userId, action: 'purchase', amount }, 'Purchase completed');

   // ❌ Avoid
   logger.info(`User ${userId} purchased for ${amount}`);
   ```

2. **Create child loggers for context**: Add persistent context to related logs
   ```typescript
   const requestLogger = logger.child({ requestId, userId });
   ```

3. **Log at appropriate levels**: Don't log everything as `info`
   - `debug`: Development/troubleshooting info
   - `info`: Important business events
   - `warn`: Recoverable issues
   - `error`: Errors that need attention

4. **Don't log sensitive data**: The logger redacts common fields, but be careful
   ```typescript
   // ✅ Safe
   logger.info({ userId: user.id }, 'User updated');

   // ❌ Dangerous
   logger.info({ user }, 'User updated'); // May contain password hash
   ```

5. **Include error context**: Always log the full error object
   ```typescript
   logger.error({ error, userId, operation }, 'Failed to process');
   ```

## Performance

- **Fast**: No external dependencies, minimal overhead
- **Small bundle**: Reduced by ~2MB compared to Pino setup
- **Faster cold starts**: No logger initialization overhead
- **Async output**: Logging won't block your application

## Local Development

During development, logs appear in your terminal in JSON format:

```bash
npm run dev
# Logs:
# {"level":"info","time":"2025-11-20T08:00:00.000Z","msg":"Server started","name":"app"}
# {"level":"debug","time":"2025-11-20T08:00:01.000Z","msg":"Processing request","requestId":"123","name":"app"}
```

**Tip**: Use `jq` to format logs for easier reading:

```bash
npm run dev 2>&1 | jq -R 'try fromjson catch .'
```

Or create a helper script:

```bash
# scripts/dev-pretty-logs.sh
npm run dev 2>&1 | jq -r 'select(.level) | "\(.time) [\(.level)] \(.msg) \(if .requestId then "(\(.requestId))" else "" end)"'
```

## Migration from Previous Logger

If upgrading from a previous version with Pino/next-logger:

1. **No code changes needed** - The API is the same:
   - `logger.info()`, `logger.error()`, etc. work identically
   - `logger.child()` works the same way
   - Both `(message, context)` and `(context, message)` signatures supported

2. **Environment variables**:
   - Keep: `LOG_LEVEL`
   - Remove: `LOG_TO_FILE`, `LOG_DIR`, `LOG_FILE_MAX_SIZE`, etc.

3. **Benefits**:
   - ✅ Fixes Vercel bundling/deployment errors
   - ✅ ~2MB smaller bundle size
   - ✅ Faster cold starts
   - ✅ Simpler codebase
   - ✅ Better Vercel dashboard integration

## Troubleshooting

**Logs not appearing:**
- Check `LOG_LEVEL` in `.env.local`
- Verify `NODE_ENV` is set correctly
- Restart dev server after changing log level

**Too many logs:**
- Increase `LOG_LEVEL` to `info` or `warn`
- Remove `debug` logs from production code

**Logs not showing in Vercel Dashboard:**
- Wait a few seconds - logs can be delayed
- Check function execution completed
- Verify you're looking at the correct deployment/environment

**Need pretty logs in development:**
- Use `jq` to format JSON: `npm run dev 2>&1 | jq`
- Or pipe through any JSON formatter

## Why Console-Based Logging?

We chose console-based logging over Pino/Winston for these reasons:

1. **Vercel Compatibility**: No bundling issues, works perfectly on serverless
2. **Simplicity**: Zero dependencies, easy to understand and maintain
3. **Performance**: Faster cold starts, smaller bundle size
4. **Platform Integration**: Logs automatically captured by Vercel/AWS/etc.
5. **Standard Approach**: Recommended by Vercel and other serverless providers

This is the recommended approach for Next.js applications on Vercel and other serverless platforms.
