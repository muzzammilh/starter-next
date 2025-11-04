# Next.js Boilerplate

A modern, production-ready Next.js boilerplate with TypeScript, Tailwind CSS, and Prisma.

## Features

- ⚡️ Next.js 16 with App Router
- 🎨 Tailwind CSS 4
- 📘 TypeScript
- 🗄️ Prisma ORM with SQLite/PostgreSQL support
- 🔐 NextAuth.js authentication with locked schema design
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
