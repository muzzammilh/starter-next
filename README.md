# Next.js Boilerplate

A modern, production-ready Next.js boilerplate with TypeScript, Tailwind CSS, and Prisma.

## Features

- ⚡️ Next.js 16 with App Router
- 🎨 Tailwind CSS 4
- 📘 TypeScript
- 🗄️ Prisma ORM with SQLite/PostgreSQL support
- 🔐 NextAuth.js authentication with locked schema design
- 📧 Email system with multiple provider support (SMTP, Resend, SendGrid, Mailjet)
- 📝 Pino logging system (structured, high-performance)
- 🛡️ API middleware (rate limiting, CORS, validation, error handling)
- 🔍 ESLint configured
- 🌙 Dark mode ready
- 📦 Modular architecture

## Documentation

### Quick Links

- **[Getting Started](./docs/getting-started.md)** - Installation and setup guide
- **[Authentication](./docs/authentication.md)** - NextAuth.js setup with OAuth and credentials
- **[Database](./docs/database.md)** - Prisma ORM configuration and usage
- **[Email System](./docs/email.md)** - Multi-provider email configuration
- **[Logging](./docs/logging.md)** - Pino logging with file rotation
- **[API Middleware](./docs/api-middleware.md)** - Rate limiting, CORS, validation, error handling
- **[File Upload](./docs/file-upload.md)** - Multi-provider file storage system
- **[Configuration](./docs/configuration.md)** - Environment variables and app configuration

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Set up database
npm run db:generate
npm run db:push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## What's Included

### Authentication System
- ✅ NextAuth.js v5 with Prisma adapter
- ✅ OAuth providers: Google, Facebook, Apple, X (Twitter), GitHub
- ✅ Email/password authentication with verification
- ✅ Locked auth schema (User, Account, Session, VerificationToken)
- ✅ Flexible extension pattern (UserProfile example)
- ✅ Type-safe session access
- ✅ Server and client auth utilities
- ✅ Protected route examples
- ✅ Custom sign-in/sign-up pages
- ✅ Auth components (SignInButton, SignOutButton, UserAvatar)

[→ Read the Authentication Guide](./docs/authentication.md)

### Database
- ✅ Prisma ORM configured
- ✅ SQLite for development (zero setup)
- ✅ PostgreSQL ready for production
- ✅ Auth tables pre-configured
- ✅ Example UserProfile extension
- ✅ Seed script template
- ✅ Migration system

[→ Read the Database Guide](./docs/database.md)

### Email System
- ✅ Multi-provider support (SMTP, Resend, SendGrid, Mailjet)
- ✅ Provider detection based on environment variables
- ✅ Explicit configuration (all API endpoints must be set)
- ✅ Beautiful HTML email templates
- ✅ Welcome, verification, and password reset emails
- ✅ Dev mode (logs to console, no config needed)
- ✅ Type-safe email API
- ✅ Helper functions for common operations
- ✅ Full logging integration

[→ Read the Email Guide](./docs/email.md)

### Logging
- ✅ next-logger + Pino (patches Next.js internal logger)
- ✅ Unified logging across entire Next.js stack
- ✅ Pretty printing in development
- ✅ JSON logs in production
- ✅ File logging with rotation (Django-style)
- ✅ Size-based and time-based rotation policies
- ✅ Separate error log files
- ✅ Automatic sensitive data redaction
- ✅ Child loggers for contextual logging
- ✅ Configurable log levels
- ✅ Ready for log aggregation services

[→ Read the Logging Guide](./docs/logging.md)

### API Middleware
- ✅ Rate limiting (prevent API abuse) ⚠️ *Needs external store for serverless*
- ✅ CORS (secure cross-origin requests)
- ✅ Request validation (type-safe with Zod)
- ✅ Authentication middleware (reusable auth checks)
- ✅ Error handling (consistent error responses)
- ✅ Request logging (automatic timing)
- ✅ Easy-to-use wrapper (`withApiMiddleware`)
- ✅ Serverless-compatible (with external store for rate limiting)

**⚠️ Important**: Rate limiting uses in-memory storage by default. For serverless deployments (Vercel, AWS Lambda, Netlify), you must use an external store like Vercel KV or Upstash Redis. See the [API Middleware Guide](./docs/api-middleware.md) for details.

[→ Read the API Middleware Guide](./docs/api-middleware.md)

### File Upload System
- ✅ Provider-agnostic architecture (switch between local, S3, Cloudinary)
- ✅ Local storage by default (zero configuration)
- ✅ AWS S3 and Cloudinary support for production
- ✅ File validation (size, type) with customizable rules
- ✅ React components with drag-and-drop support
- ✅ Upload presets for common use cases
- ✅ Database integration for file tracking
- ✅ Complete REST API with authentication

**⚠️ Note**: Local storage is not suitable for serverless deployments. Use S3 or Cloudinary for Vercel, AWS Lambda, or similar platforms.

[→ Read the File Upload Guide](./docs/file-upload.md)

### Development Tools
- ✅ TypeScript with strict mode
- ✅ ESLint configured
- ✅ Tailwind CSS 4
- ✅ Dark mode support
- ✅ Hot reload
- ✅ Path aliases (@/lib, @/components)

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── (auth)/              # Auth pages group
│   ├── api/                 # API routes
│   ├── dashboard/           # Protected route example
│   └── examples/            # Example pages
├── components/              # Reusable components
│   └── auth/               # Auth-related components
├── lib/                     # Shared utilities and configuration
│   ├── auth/               # Authentication utilities
│   ├── db/                 # Database client
│   ├── email/              # Email system
│   ├── logger/             # Logging utilities
│   └── config.ts           # App configuration
├── prisma/                  # Database schema and migrations
├── docs/                    # Documentation
├── public/                  # Static assets
└── data/                    # Local database files (SQLite)
```

## Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Create and run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with data
```

## Configuration

All configuration is done through environment variables. Copy `.env.example` to `.env.local` and update with your values.

### Required Variables

```env
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="file:./data/local.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

[→ See Full Configuration Guide](./docs/configuration.md)

## Usage Examples

### Protect a Route

```tsx
import { getCurrentUser } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  
  return <div>Welcome {user.email}</div>;
}
```

### Query the Database

```typescript
import { prisma } from '@/lib/db';

const users = await prisma.user.findMany();
```

### Send an Email

```typescript
import { sendWelcomeEmail } from '@/lib/email/utils';

await sendWelcomeEmail('user@example.com', 'John Doe');
```

### Add Logging

```typescript
import { logger } from '@/lib/logger';

logger.info({ userId: '123' }, 'User logged in');
```

### Protect an API Route

```typescript
import { withApiMiddleware } from '@/lib/api/utils';

export const POST = withApiMiddleware(
  async (request) => {
    return NextResponse.json({ success: true });
  },
  {
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    cors: { allowedOrigins: ['https://example.com'] },
  }
);
```

### Upload a File

```typescript
import { storage } from '@/lib/storage';

// Upload with default settings
const result = await storage.upload(file);
console.log(result.url);

// Upload with preset
const result = await storage.upload(file, storagePresets.avatar);
```

### Use Upload Component

```tsx
import { FileUpload } from '@/components/upload/FileUpload';

<FileUpload
  onUploadComplete={(result) => console.log(result.url)}
  preset="avatar"
/>
```

## Production Deployment

### Checklist

- [ ] Switch to PostgreSQL (update `prisma/schema.prisma`)
- [ ] Set production environment variables
- [ ] Configure OAuth redirect URIs for production domain
- [ ] Set up email provider
- [ ] Enable HTTPS
- [ ] Configure logging for production (`LOG_LEVEL="info"`)
- [ ] **Choose storage provider** (S3 or Cloudinary for serverless)
- [ ] **Set up rate limiting external store** (Vercel KV or Upstash for serverless)
- [ ] Run database migrations (`npm run db:migrate`)
- [ ] Test all features in production environment

### Recommended Platforms

- **[Vercel](https://vercel.com)** - Optimized for Next.js
- **[Railway](https://railway.app)** - Easy PostgreSQL setup
- **[Netlify](https://netlify.com)** - Great for static sites
- **[AWS Amplify](https://aws.amazon.com/amplify/)** - Full AWS integration

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## License

See [LICENSE](LICENSE) file for details.
