# Next.js Boilerplate

A modern, production-ready Next.js boilerplate with TypeScript, Tailwind CSS, and Prisma.

## Features

- ⚡️ Next.js 16 with App Router
- 🎨 Tailwind CSS 4
- 📘 TypeScript
- 🗄️ Prisma ORM with SQLite/PostgreSQL support
- 🔐 NextAuth.js authentication with locked schema design
- 📝 Pino logging system (structured, high-performance)
- 🔍 ESLint configured
- 🌙 Dark mode ready
- 📦 Modular architecture

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

1. Clone or use this template
2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration values

5. Set up the database:

```bash
npm run db:generate  # Generate Prisma Client
npm run db:push      # Create database tables
npm run db:seed      # (Optional) Seed with example data
```

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Authentication

This boilerplate includes a complete NextAuth.js authentication system with a **locked schema design** that keeps auth tables frozen while allowing flexible app-specific extensions.

### Features

- **Locked Auth Schema**: Core tables (`User`, `Account`, `Session`, `VerificationToken`) never change
- **Flexible Extensions**: Add your own tables (`UserProfile`, `UserSettings`, etc.) that reference `User`
- **Multiple OAuth Providers**: Google, Facebook, Apple, X (Twitter), GitHub
- **Email/Password Authentication**: Traditional credentials-based login
- **Type-Safe**: Full TypeScript support with proper session typing
- **Ready to Use**: Sign-in pages, components, and utilities included

### Why Separate User and Account Tables?

One user can sign in through multiple providers (Google, Facebook, etc.). The `Account` table stores provider-specific data while `User` maintains a single identity. This allows users to link multiple auth methods to one account.

### Quick Setup

1. **Generate Auth Secret** (already done in `.env.local`):
   ```bash
   openssl rand -base64 32
   ```

2. **Choose Authentication Method:**

   **Option A: Email/Password (Easiest for Testing)**
   - Already enabled in `.env.local` with `ENABLE_CREDENTIALS_AUTH="true"`
   - Dev mode credentials: `demo@example.com` / `password`
   - No external setup required
   - Perfect for testing the auth flow immediately

   **Option B: OAuth Providers** (choose at least one):

   **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Add to `.env.local`:
     ```env
     GOOGLE_CLIENT_ID="your-client-id"
     GOOGLE_CLIENT_SECRET="your-client-secret"
     ```

   **Facebook OAuth:**
   - Go to [Facebook Developers](https://developers.facebook.com/apps)
   - Create new app and get credentials
   - Add redirect URI: `http://localhost:3000/api/auth/callback/facebook`
   - Add to `.env.local`:
     ```env
     FACEBOOK_CLIENT_ID="your-app-id"
     FACEBOOK_CLIENT_SECRET="your-app-secret"
     ```

   **Apple OAuth:**
   - Go to [Apple Developer](https://developer.apple.com/account/resources/identifiers/list/serviceId)
   - Create Service ID and configure Sign in with Apple
   - Add to `.env.local`:
     ```env
     APPLE_ID="your-service-id"
     APPLE_SECRET="your-secret"
     ```

   **X (Twitter) OAuth:**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Create app and enable OAuth 2.0
   - Add redirect URI: `http://localhost:3000/api/auth/callback/twitter`
   - Add to `.env.local`:
     ```env
     TWITTER_CLIENT_ID="your-client-id"
     TWITTER_CLIENT_SECRET="your-client-secret"
     ```

   **GitHub OAuth:**
   - Go to [GitHub Settings](https://github.com/settings/developers)
   - Create OAuth App
   - Set callback URL: `http://localhost:3000/api/auth/callback/github`
   - Add to `.env.local`:
     ```env
     GITHUB_ID="your-client-id"
     GITHUB_SECRET="your-client-secret"
     ```

3. **Test Authentication**:
   - Start dev server: `npm run dev`
   - Visit: `http://localhost:3000/signin`
   - Sign in with configured provider
   - Visit: `http://localhost:3000/dashboard` (protected route example)

### Database Schema

**Locked Tables (Never Modify):**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  emailVerified DateTime?
  accounts      Account[]  // Multiple auth providers
  sessions      Session[]  // User sessions
  profile       UserProfile?  // Your extensions
}

model Account { /* OAuth provider data */ }
model Session { /* Session management */ }
model VerificationToken { /* Email verification */ }
```

**Extension Tables (Customize Freely):**
```prisma
model UserProfile {
  userId    String  @unique
  name      String?
  image     String?
  bio       String?
  user      User    @relation(...)
}

// Add your own tables:
// model UserSettings { ... }
// model UserSubscription { ... }
```

### Usage Examples

**Protect a Server Component:**
```tsx
import { getCurrentUser } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  
  return <div>Welcome {user.email}</div>;
}
```

**Client Component with Auth:**
```tsx
"use client";
import { useSession } from "next-auth/react";
import { SignInButton, SignOutButton } from "@/components/auth";

export function Header() {
  const { data: session } = useSession();
  return session ? <SignOutButton /> : <SignInButton />;
}
```

**Protect API Routes:**
```tsx
import { getCurrentSession } from "@/lib/auth/utils";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  // Your logic here
}
```

### Available Auth Utilities

**Server-Side** (use in Server Components, API routes, Server Actions):
- `getCurrentUser()` - Get authenticated user with profile
- `getCurrentSession()` - Get NextAuth session
- `getUserWithProfile(userId)` - Get any user by ID with profile
- `upsertUserProfile(userId, data)` - Create/update user profile
- `isAuthenticated()` - Check if user is authenticated
- `requireAuth()` - Require authentication (throws if not authenticated)

**Client-Side** (use in Client Components):
- `useSession()` - Hook to access session
- `signIn(provider)` - Trigger sign-in
- `signOut()` - Trigger sign-out
- `<SignInButton />` - Pre-built sign-in button
- `<SignOutButton />` - Pre-built sign-out button
- `<UserAvatar />` - User avatar component

### Extending User Data

Add your own tables that reference the User:

```prisma
// prisma/schema.prisma

model UserSettings {
  id       String  @id @default(cuid())
  userId   String  @unique
  theme    String  @default("light")
  language String  @default("en")
  user     User    @relation(fields: [userId], references: [id])
}

// Add relation to User model:
model User {
  // ... existing fields
  settings UserSettings?
}
```

Then run: `npm run db:push`

### Customization

**Enable/Disable Providers:**
Providers are automatically enabled based on environment variables. No code changes needed!
- OAuth providers: Auto-enabled when credentials are present
- Email magic link: Set `EMAIL_SERVER` and `EMAIL_FROM`
- Credentials auth: Set `ENABLE_CREDENTIALS_AUTH=true` and implement logic in `lib/auth/options.ts`

Configuration is managed in `lib/config.ts` - providers are enabled/disabled based on available credentials.

**Customize Sign-In Page:**
Edit `app/(auth)/signin/page.tsx` to match your brand

**Configure Session:**
Edit `lib/auth/config.ts` to adjust session duration and callbacks

**Update Components:**
Customize auth components in `components/auth/` to match your design system

### Production Deployment

1. Switch to PostgreSQL (update `prisma/schema.prisma`)
2. Set `NEXTAUTH_URL` to your production domain
3. Generate new `NEXTAUTH_SECRET` for production
4. Configure OAuth redirect URIs for production domain
5. Enable HTTPS

### Troubleshooting

**"Configuration" Error:**
- Check `NEXTAUTH_SECRET` is set in `.env.local`
- Verify `NEXTAUTH_URL` matches your domain
- Restart dev server

**OAuth Not Working:**
- Verify client IDs and secrets are correct
- Check redirect URIs match exactly (including http/https)
- Ensure OAuth app is not in development mode

**Session Not Persisting:**
- Check database connection
- Verify `sessions` table exists
- Check browser cookies are enabled

## Logging

This boilerplate includes a production-ready logging system using **next-logger** with **Pino**, providing structured, high-performance logging throughout your Next.js application.

### What is next-logger?

`next-logger` patches Next.js's internal logger to use Pino, giving you:
- **Unified logging** from Next.js framework, server components, API routes, and your application code
- **Structured JSON logs** from the entire Next.js stack (build, routing, rendering, etc.)
- **Zero configuration** - works out of the box with Next.js conventions
- **High performance** - Pino is one of the fastest Node.js loggers available

### Features

- 🚀 **High Performance**: Asynchronous logging with minimal overhead
- 📊 **Structured Logs**: JSON format in production for easy parsing
- 🎨 **Pretty Printing**: Colorized, readable logs in development
- 🔒 **Security**: Automatic redaction of sensitive fields (passwords, tokens, etc.)
- 🎯 **Contextual**: Child loggers for request-specific context
- ⚙️ **Configurable**: Environment-based log levels
- 🔧 **Next.js Integration**: Patches Next.js's internal logger automatically

### Quick Start

**Basic Usage:**
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

**In Server Components:**
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

**In API Routes:**
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

**In Server Actions:**
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

### Configuration

**Log Levels:**

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

### Child Loggers (Contextual Logging)

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

### Security: Sensitive Data Redaction

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

### How It Works

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

### Production Setup

**For Production Environments:**

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

### Examples

**Example 1: Database Operations**
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

**Example 2: Authentication Flow**
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

**Example 3: Error Tracking**
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

### Best Practices

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

### Performance Notes

- Pino is **5-10x faster** than other Node.js loggers
- Asynchronous by default - won't block your application
- JSON serialization is optimized for speed
- In production, logging overhead is typically < 1ms per log

### Troubleshooting

**Logs not appearing:**
- Check `LOG_LEVEL` in `.env.local`
- Verify `NODE_ENV` is set correctly
- Restart dev server after changing log level

**Too many logs:**
- Increase `LOG_LEVEL` to `info` or `warn`
- Remove `debug` logs from production code

**Logs not formatted in development:**
- Ensure `pino-pretty` is installed: `npm install pino-pretty`
- Check `NODE_ENV` is not set to `production`

## Configuration

### Environment Variables

All configurable values should be stored in `.env.local`. See `.env.example` for available options.

### Database Setup

This boilerplate uses Prisma ORM with support for SQLite (local development) and PostgreSQL (production).

**For local development (SQLite - default):**
- No additional setup needed
- Database file is created automatically at `./data/local.db`
- Perfect for getting started quickly

**For production (PostgreSQL):**
1. Update `prisma/schema.prisma` - change `provider = "sqlite"` to `provider = "postgresql"`
2. Update `DATABASE_URL` in `.env.local` with your PostgreSQL connection string
3. Run migrations: `npm run db:migrate`

**Database Commands:**
- `npm run db:generate` - Generate Prisma Client (run after schema changes)
- `npm run db:push` - Push schema changes to database (for prototyping)
- `npm run db:migrate` - Create and run migrations (for production)
- `npm run db:studio` - Open Prisma Studio (visual database editor)
- `npm run db:seed` - Seed database with example data

### App Metadata

Update the following files with your app information:

- `app/layout.tsx` - Site metadata (title, description)
- `.env.local` - Environment-specific configuration
- `package.json` - Project name and details
- `prisma/schema.prisma` - Database models for your application

### Customization Points

Look for `// TODO:` comments throughout the codebase for values you should customize.

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── (auth)/              # Auth pages group
│   │   └── signin/          # Sign-in page
│   ├── api/auth/            # NextAuth API routes
│   ├── dashboard/           # Protected route example
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # Reusable components
│   └── auth/               # Auth-related components
├── lib/                     # Shared utilities and configuration
│   ├── auth/               # Authentication utilities
│   │   ├── config.ts       # NextAuth configuration
│   │   ├── options.ts      # Auth providers
│   │   └── utils.ts        # Auth helper functions
│   ├── db/                 # Database client and exports
│   │   ├── index.ts        # Database exports
│   │   └── prisma.ts       # Prisma client instance
│   └── config.ts           # App configuration
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma       # Database schema definition
│   └── seed.ts             # Database seed script
├── types/                   # TypeScript type definitions
│   └── next-auth.d.ts      # NextAuth type extensions
├── public/                  # Static assets
├── data/                    # Local database files (SQLite)
├── .env.example             # Environment variables template
└── .env.local               # Your local environment variables (create this)
```

## Scripts

**Development:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Database:**
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with data

## Database Usage Example

```typescript
// Import the Prisma client
import { prisma } from '@/lib/db';

// Create a new user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});

// Query users
const users = await prisma.user.findMany();

// Update a user
const updated = await prisma.user.update({
  where: { id: user.id },
  data: { name: 'Jane Doe' },
});
```

## Switching to PostgreSQL

1. Install PostgreSQL locally or use a hosted service (Supabase, Neon, Railway, etc.)
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Update `DATABASE_URL` in `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```
4. Generate client and run migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## What's Included

### Authentication System
- ✅ NextAuth.js v5 with Prisma adapter
- ✅ OAuth providers: Google, Facebook, Apple, X (Twitter), GitHub
- ✅ Locked auth schema (User, Account, Session, VerificationToken)
- ✅ Flexible extension pattern (UserProfile example)
- ✅ Type-safe session access
- ✅ Server and client auth utilities
- ✅ Protected route examples
- ✅ Custom sign-in page with all providers
- ✅ Auth components (SignInButton, SignOutButton, UserAvatar)

### Database
- ✅ Prisma ORM configured
- ✅ SQLite for development (zero setup)
- ✅ PostgreSQL ready for production
- ✅ Auth tables pre-configured
- ✅ Example UserProfile extension
- ✅ Seed script template

### Logging
- ✅ next-logger + Pino (patches Next.js internal logger)
- ✅ Unified logging across entire Next.js stack
- ✅ Pretty printing in development
- ✅ JSON logs in production
- ✅ Automatic sensitive data redaction
- ✅ Child loggers for contextual logging
- ✅ Configurable log levels
- ✅ Ready for log aggregation services

### Development Tools
- ✅ TypeScript with strict mode
- ✅ ESLint configured
- ✅ Tailwind CSS 4
- ✅ Dark mode support
- ✅ Hot reload
- ✅ Path aliases (@/lib, @/components)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## License

See [LICENSE](LICENSE) file for details.
