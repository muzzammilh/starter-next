# Logging

This boilerplate includes a production-ready logging system using **next-logger** with **Pino**, providing structured, high-performance logging throughout your Next.js application.

## What is next-logger?

`next-logger` patches Next.js's internal logger to use Pino, giving you:
- **Unified logging** from Next.js framework, server components, API routes, and your application code
- **Structured JSON logs** from the entire Next.js stack (build, routing, rendering, etc.)
- **Zero configuration** - works out of the box with Next.js conventions
- **High performance** - Pino is one of the fastest Node.js loggers available

## Features

- 🚀 **High Performance**: Asynchronous logging with minimal overhead
- 📊 **Structured Logs**: JSON format in production for easy parsing
- 🎨 **Pretty Printing**: Colorized, readable logs in development
- 🔒 **Security**: Automatic redaction of sensitive fields (passwords, tokens, etc.)
- 🎯 **Contextual**: Child loggers for request-specific context
- ⚙️ **Configurable**: Environment-based log levels
- 🔧 **Next.js Integration**: Patches Next.js's internal logger automatically

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
- Development: Pretty-printed, colorized logs with `debug` level
- Production: JSON-formatted logs with `info` level

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
// Output: {"level":"info","userId":"123","tenantId":"abc","msg":"User action"}

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

// Output: {"level":"info","username":"john","password":"[REDACTED]","token":"[REDACTED]"}
```

**Redacted fields by default:**
- `password`
- `token`
- `apiKey`
- `secret`
- `authorization`

**Add custom redaction:**

Edit `lib/logger.ts`:
```typescript
redact: {
  paths: ['password', 'token', 'apiKey', 'secret', 'authorization', 'ssn', 'creditCard'],
  censor: '[REDACTED]',
}
```

## How It Works

The logging system consists of three parts:

1. **`instrumentation.ts`** - Next.js instrumentation hook that loads next-logger
   - Automatically loaded by Next.js (no config needed in Next.js 16+)
   - Patches Next.js's internal logger to use Pino
   - Only runs in Node.js runtime (not Edge)

2. **`next-logger.config.js`** - Pino configuration for Next.js framework logs
   - Automatically picked up by next-logger
   - Configures log levels, pretty printing, and redaction
   - Applies to all Next.js internal logs (build, routing, etc.)

3. **`lib/logger.ts`** - Application logger for your code
   - Uses the same Pino configuration as next-logger
   - Import and use in your components, API routes, and server actions

## File Logging with Rotation (Django-style)

In addition to stdout logging, you can enable file-based logging with automatic rotation policies, similar to Django's logging handlers.

### Enable File Logging

Add to your `.env.local`:

```env
# Enable file logging
LOG_TO_FILE=true

# Optional: Configure rotation policies
LOG_DIR=./logs                # Log directory (default: ./logs)
LOG_FILE_MAX_SIZE=10M         # Max file size before rotation (default: 10M)
LOG_FILE_MAX_FILES=10         # Number of rotated files to keep (default: 10)
LOG_FILE_MAX_AGE=7d           # Max age of log files (optional, e.g., 7d, 24h)
```

### What You Get

When file logging is enabled, logs are written to:
- `logs/app.json` - All logs in JSON format (structured logging)
- `logs/error.json` - Error logs only (for easier debugging)

All logs use JSON format (no worker threads, dev server compatible). To view in human-readable format, use `jq`:
```bash
cat logs/app.json | jq -r '.time + " " + .level + " " + .msg'
```

### Important Notes

- **Serverless Compatible**: File logging is automatically disabled in serverless environments (Vercel, AWS Lambda, Netlify, Google Cloud Functions, Cloudflare Workers). Logs go to stdout and are captured by the platform.
- **Dev Server Compatible**: Uses JSON-only format (no worker threads) to avoid conflicts with Next.js dev server hot reload.
- **View Human-Readable**: Use `jq` to format JSON logs: `cat logs/app.json | jq`

### Rotation Policies

1. **Size-based rotation** (default):
   - Rotates when file reaches `LOG_FILE_MAX_SIZE`
   - Keeps `LOG_FILE_MAX_FILES` rotated files
   - Example: `app.json`, `app.json.1`, `app.json.2`, etc.

2. **Time-based rotation**:
   - Set `LOG_FILE_MAX_AGE` (e.g., `7d`, `24h`, `60m`)
   - Rotates based on time intervals
   - Useful for high-traffic applications

3. **Hybrid approach**:
   - Combine both size and time-based rotation
   - Rotates when either condition is met

### Comparison with Django

| Django | Next.js (This Setup) |
|--------|---------------------|
| `RotatingFileHandler` | Size-based rotation with `pino-roll` |
| `TimedRotatingFileHandler` | Time-based rotation with `pino-roll` |
| `maxBytes` | `LOG_FILE_MAX_SIZE` (10M, 100K, 1G) |
| `backupCount` | `LOG_FILE_MAX_FILES` |
| Multiple handlers | Multiple streams (stdout + files) |
| Separate error logs | ✅ `error.json` file |

### Production Example

```env
# High-traffic application
LOG_TO_FILE=true
LOG_FILE_MAX_SIZE=50M
LOG_FILE_MAX_AGE=1d
LOG_FILE_MAX_FILES=30
LOG_LEVEL=info
```

### Analyzing Logs

```bash
# View JSON logs with jq
cat logs/app.json | jq

# Filter errors only
cat logs/app.json | jq 'select(.level >= 50)'

# Search for specific user
cat logs/app.json | jq 'select(.userId == "123")'

# Tail in real-time with formatting
tail -f logs/app.json | jq -r '.time + " " + .level + " " + .msg'
```

### Serverless Deployment

File logging is automatically disabled when deploying to:
- **Vercel**: Logs appear in Vercel Dashboard → Logs tab
- **AWS Lambda**: Logs sent to CloudWatch Logs automatically
- **Netlify**: Logs appear in Functions → Function Logs
- **Google Cloud Functions**: Logs sent to Cloud Logging
- **Cloudflare Workers**: Logs appear in Cloudflare dashboard

No configuration needed - the logger detects the environment and adapts automatically.

### Integration with Log Aggregation

The JSON format works seamlessly with:
- **Datadog**: Forward logs using Datadog agent or HTTP intake
- **Elasticsearch**: Use Filebeat to ship logs
- **CloudWatch**: Use CloudWatch agent (for traditional servers)
- **Splunk**: Use Splunk forwarder
- **Grafana Loki**: Use Promtail
- **Axiom**: Use `@axiomhq/pino` transport
- **LogFlare**: Use `pino-logflare` transport

## Production Setup

### For Production Environments

1. **Set log level to `info` or `warn`:**
   ```env
   LOG_LEVEL="info"
   ```

2. **JSON logs are automatically enabled** in production (when `NODE_ENV=production`)

3. **Ship logs to external services:**

   The JSON format works with all major log aggregation services:
   - **Datadog**: Use Datadog agent or HTTP intake
   - **LogFlare**: Use `pino-logflare` transport
   - **Axiom**: Use HTTP intake
   - **CloudWatch**: Use `pino-cloudwatch` transport
   - **Elasticsearch**: Use `pino-elasticsearch` transport
   - **Loki**: Use `pino-loki` transport

   Example with external transport:
   ```bash
   npm install pino-logflare
   ```

   Update `next-logger.config.js`:
   ```javascript
   const pino = require('pino');
   
   const logger = (defaultConfig) =>
     pino({
       ...defaultConfig,
       level: process.env.LOG_LEVEL || 'info',
       transport: process.env.NODE_ENV === 'production' ? {
         target: 'pino-logflare',
         options: {
           apiKey: process.env.LOGFLARE_API_KEY,
           sourceToken: process.env.LOGFLARE_SOURCE_TOKEN,
         }
       } : { /* dev config */ }
     });
   
   module.exports = { logger };
   ```

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
  
  // Re-throw or handle
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

## Performance Notes

- Pino is **5-10x faster** than other Node.js loggers
- Asynchronous by default - won't block your application
- JSON serialization is optimized for speed
- Logging overhead is typically < 1ms per log
- JSON format is production-ready and works with all log aggregation services

## Troubleshooting

**Logs not appearing:**
- Check `LOG_LEVEL` in `.env.local`
- Verify `NODE_ENV` is set correctly
- Restart dev server after changing log level

**Too many logs:**
- Increase `LOG_LEVEL` to `info` or `warn`
- Remove `debug` logs from production code

**Logs are in JSON format:**
- This is expected - all logs use JSON format for structured logging
- JSON logs work with all log aggregation tools (Datadog, CloudWatch, etc.)
- They're still readable and contain all the information you need

**File logs not being created:**
- Verify `LOG_TO_FILE=true` is set
- Check log directory permissions
- Look for errors in terminal output
