# Configuration

Learn how to configure your Next.js application for different environments and use cases.

## Environment Variables

All configurable values should be stored in `.env.local`. See `.env.example` for available options.

### Required Variables

```env
# App Configuration
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
DATABASE_URL="file:./data/local.db"

# Authentication
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional Variables

```env
# Logging
LOG_LEVEL="debug"
LOG_TO_FILE="false"

# Email (choose one provider)
EMAIL_FROM="Your App <noreply@yourapp.com>"

# SMTP
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-password"

# Resend
RESEND_API_KEY="re_123456789"
RESEND_API_URL="https://api.resend.com/emails"

# SendGrid
SENDGRID_API_KEY="SG.123456789"
SENDGRID_API_URL="https://api.sendgrid.com/v3/mail/send"

# Mailjet
MAILJET_API_KEY="your-api-key"
MAILJET_API_SECRET="your-api-secret"
MAILJET_API_URL="https://api.mailjet.com/v3.1/send"

# OAuth Providers
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

GITHUB_ID="your-client-id"
GITHUB_SECRET="your-client-secret"

FACEBOOK_CLIENT_ID="your-app-id"
FACEBOOK_CLIENT_SECRET="your-app-secret"

TWITTER_CLIENT_ID="your-client-id"
TWITTER_CLIENT_SECRET="your-client-secret"

APPLE_ID="your-service-id"
APPLE_SECRET="your-secret"

# Credentials Auth (for testing)
ENABLE_CREDENTIALS_AUTH="true"
```

## App Configuration

The main configuration file is `lib/config.ts`. This file exports configuration values used throughout the application.

### Basic Configuration

```typescript
// lib/config.ts
export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Your App',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  auth: {
    providers: {
      google: !!process.env.GOOGLE_CLIENT_ID,
      github: !!process.env.GITHUB_ID,
      facebook: !!process.env.FACEBOOK_CLIENT_ID,
      twitter: !!process.env.TWITTER_CLIENT_ID,
      apple: !!process.env.APPLE_ID,
      credentials: process.env.ENABLE_CREDENTIALS_AUTH === 'true',
    },
  },
  email: {
    from: process.env.EMAIL_FROM || 'noreply@example.com',
  },
};
```

### Using Configuration

```typescript
import { config } from '@/lib/config';

console.log(config.app.name); // "Your App"
console.log(config.auth.providers.google); // true/false
```

## Database Configuration

### SQLite (Development)

Default configuration for local development:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

```env
# .env.local
DATABASE_URL="file:./data/local.db"
```

### PostgreSQL (Production)

For production environments:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Connection Pooling

For serverless environments:

```env
# With PgBouncer
DATABASE_URL="postgresql://user:password@host:5432/dbname?pgbouncer=true"

# With Prisma Data Proxy
DATABASE_URL="prisma://aws-us-east-1.prisma-data.com/?api_key=..."
```

## Authentication Configuration

### NextAuth Configuration

Main configuration in `lib/auth/config.ts`:

```typescript
export const authConfig = {
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/auth/error',
  },
};
```

### Provider Configuration

Providers are configured in `lib/auth/options.ts` and automatically enabled based on environment variables.

### Custom Callbacks

Edit `lib/auth/config.ts` to customize callbacks:

```typescript
export const authConfig = {
  callbacks: {
    async session({ session, user }) {
      // Add custom data to session
      session.user.id = user.id;
      return session;
    },
    async signIn({ user, account, profile }) {
      // Custom sign-in logic
      return true;
    },
  },
};
```

## Email Configuration

### Provider Selection

The email system automatically selects a provider based on environment variables:

1. Resend (if `RESEND_API_KEY` is set)
2. SendGrid (if `SENDGRID_API_KEY` is set)
3. Mailjet (if `MAILJET_API_KEY` is set)
4. SMTP (if `EMAIL_HOST` is set)
5. Dev mode (logs to console)

### Custom Templates

Add custom templates in `lib/email/templates/`:

```typescript
// lib/email/templates/custom.ts
export function customEmail(data: any) {
  return {
    subject: 'Custom Email',
    html: `<h1>Hello ${data.name}</h1>`,
    text: `Hello ${data.name}`,
  };
}
```

## Logging Configuration

### Log Levels

Set in `.env.local`:

```env
LOG_LEVEL="debug"  # Development
LOG_LEVEL="info"   # Production
LOG_LEVEL="error"  # Only errors
```

### File Logging

Enable file logging with rotation:

```env
LOG_TO_FILE="true"
LOG_DIR="./logs"
LOG_FILE_MAX_SIZE="10M"
LOG_FILE_MAX_FILES="10"
LOG_FILE_MAX_AGE="7d"
```

### Custom Logger Configuration

Edit `lib/logger.ts` to customize:

```typescript
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['password', 'token', 'apiKey', 'secret'],
    censor: '[REDACTED]',
  },
});
```

## Styling Configuration

### Tailwind CSS

Configure in `tailwind.config.ts`:

```typescript
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      },
    },
  },
};
```

### Global Styles

Edit `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
}
```

## TypeScript Configuration

### Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Usage:

```typescript
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
```

### Strict Mode

The boilerplate uses TypeScript strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## Next.js Configuration

### Basic Configuration

Edit `next.config.ts`:

```typescript
const nextConfig = {
  // Enable experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Image optimization
  images: {
    domains: ['example.com'],
  },
};

export default nextConfig;
```

### Environment Variables

Next.js automatically loads:
- `.env.local` - Local overrides (not committed)
- `.env.development` - Development defaults
- `.env.production` - Production defaults
- `.env` - All environments

Public variables must be prefixed with `NEXT_PUBLIC_`:

```env
NEXT_PUBLIC_APP_NAME="Your App"  # Available in browser
DATABASE_URL="..."                # Server-only
```

## Production Configuration

### Environment Setup

Create `.env.production`:

```env
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourapp.com"
DATABASE_URL="postgresql://..."
LOG_LEVEL="info"
LOG_TO_FILE="true"
```

### Build Configuration

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Optimization

1. **Enable compression**:
   ```typescript
   // next.config.ts
   const nextConfig = {
     compress: true,
   };
   ```

2. **Configure caching**:
   ```typescript
   // app/api/route.ts
   export const revalidate = 3600; // 1 hour
   ```

3. **Optimize images**:
   ```tsx
   import Image from 'next/image';
   
   <Image
     src="/image.jpg"
     width={500}
     height={300}
     alt="Description"
   />
   ```

## Security Configuration

### Content Security Policy

Add to `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval';",
          },
        ],
      },
    ];
  },
};
```

### CORS Configuration

For API routes:

```typescript
// app/api/route.ts
export async function GET(request: Request) {
  return new Response(JSON.stringify({ data: 'value' }), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}
```

## Customization Points

Look for `// TODO:` comments throughout the codebase for values you should customize:

- `app/layout.tsx` - Site metadata
- `lib/config.ts` - App configuration
- `prisma/schema.prisma` - Database models
- `components/auth/` - Auth components
- `lib/email/templates/` - Email templates

## Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use environment-specific files** - `.env.development`, `.env.production`
3. **Validate environment variables** - Check required vars on startup
4. **Use type-safe config** - Export typed config objects
5. **Document all variables** - Keep `.env.example` updated
6. **Rotate secrets regularly** - Especially in production
7. **Use different secrets per environment** - Never reuse production secrets in development
