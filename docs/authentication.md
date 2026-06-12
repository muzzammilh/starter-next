# Authentication

This boilerplate includes a complete NextAuth.js authentication system with a **locked schema design** that keeps auth tables frozen while allowing flexible app-specific extensions.

## Features

- **Locked Auth Schema**: Core tables (`User`, `Account`, `Session`, `VerificationToken`) never change
- **Flexible Extensions**: Add your own tables (`UserProfile`, `UserSettings`, etc.) that reference `User`
- **Multiple OAuth Providers**: Google, Facebook, Apple, X (Twitter), GitHub
- **Email/Password Authentication**: Traditional credentials-based login
- **Type-Safe**: Full TypeScript support with proper session typing
- **Ready to Use**: Sign-in pages, components, and utilities included

## Why Separate User and Account Tables?

One user can sign in through multiple providers (Google, Facebook, etc.). The `Account` table stores provider-specific data while `User` maintains a single identity. This allows users to link multiple auth methods to one account.

## Quick Setup

### 1. Generate Auth Secret

Already done in `.env.local`:
```bash
openssl rand -base64 32
```

### 2. Choose Authentication Method

**Option A: Email/Password (Easiest for Testing)**
- Already enabled in `.env.local` with `ENABLE_CREDENTIALS_AUTH="true"`
- Dev mode credentials: `demo@example.com` / `password`
- No external setup required
- Perfect for testing the auth flow immediately
- **Sign up page**: Visit `/signup` to create new accounts
- **Sign in page**: Visit `/signin` to log in with existing accounts
- **Email verification**: Required for new signups (verification email sent automatically)
- Password requirements: 8+ characters with uppercase, lowercase, and number
- **Note**: Configure email provider (see Email System section) for verification emails to work

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

### 3. Test Authentication

- Start dev server: `npm run dev`
- **For Email/Password**: Visit `http://localhost:3000/signup` to create an account, then sign in at `/signin`
- **For OAuth**: Visit `http://localhost:3000/signin` and click your configured provider
- Visit: `http://localhost:3000/dashboard` (protected route example)

## Database Schema

### Locked Tables (Never Modify)

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

### Extension Tables (Customize Freely)

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

## Usage Examples

### Protect a Server Component

```tsx
import { getCurrentUser } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  
  return <div>Welcome {user.email}</div>;
}
```

### Client Component with Auth

```tsx
"use client";
import { useSession } from "next-auth/react";
import { SignInButton, SignOutButton } from "@/components/auth";

export function Header() {
  const { data: session } = useSession();
  return session ? <SignOutButton /> : <SignInButton />;
}
```

### Protect API Routes

```tsx
import { getCurrentSession } from "@/lib/auth/utils";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  // Your logic here
}
```

## User Roles

This boilerplate includes a role-based access control system with four predefined roles:

- **`user`** (default) - Regular authenticated user with standard access
- **`admin`** - Full system access, can manage everything
- **manager** - Middle-tier access, can manage users and content
- **`guest`** - Restricted access, useful for trial/read-only users

### Setting User Roles

By default, all new users are assigned the `user` role. To promote a user to admin or another role:

1. Run Prisma Studio: `npx prisma studio`
2. Navigate to the `User` table
3. Find the user and change their `role` field
4. Save the changes

The user will have the new role on their next login.

### Using Roles in Code

```tsx
// Server Component - Check if user is admin
import { isAdmin, requireAdmin } from "@/lib/auth/utils";

export default async function AdminPage() {
  await requireAdmin(); // Throws error if not admin
  return <div>Admin Dashboard</div>;
}

// Server Component - Check role conditionally
export default async function DashboardPage() {
  const admin = await isAdmin();
  return (
    <div>
      {admin && <AdminPanel />}
      <UserContent />
    </div>
  );
}

// API Route - Require specific role
// Note: This is the middleware version for API routes (takes request + role)
// Use requireRole from "@/lib/auth/utils" for Server Components/Actions (takes role only)
import { requireRole } from "@/lib/api/middleware/auth";

export async function DELETE(request: NextRequest) {
  const authError = await requireRole(request, "admin");
  if (authError) return authError;

  // Admin-only logic here
}
```

## Available Auth Utilities

### Server-Side
Use in Server Components, API routes, Server Actions:
- `getCurrentUser()` - Get authenticated user with profile
- `getCurrentSession()` - Get NextAuth session
- `getUserWithProfile(userId)` - Get any user by ID with profile
- `upsertUserProfile(userId, data)` - Create/update user profile
- `isAuthenticated()` - Check if user is authenticated
- `requireAuth()` - Require authentication (throws if not authenticated)
- `getCurrentUserRole()` - Get current user's role
- `hasRole(role)` - Check if user has specific role
- `isAdmin()` - Check if user is admin
- `isManager()` - Check if user is manager
- `isAdminOrManager()` - Check if user is admin or manager
- `requireRole(role)` - Require specific role (throws if not authorized)
- `requireAdmin()` - Require admin role (throws if not admin)

### Client-Side
Use in Client Components:
- `useSession()` - Hook to access session
- `signIn(provider)` - Trigger sign-in
- `signOut()` - Trigger sign-out
- `<SignInButton />` - Pre-built sign-in button
- `<SignOutButton />` - Pre-built sign-out button
- `<UserAvatar />` - User avatar component

## Extending User Data

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

## Customization

### Enable/Disable Providers

Providers are automatically enabled based on environment variables. No code changes needed!
- OAuth providers: Auto-enabled when credentials are present
- Email magic link: Set `EMAIL_SERVER` and `EMAIL_FROM`
- Credentials auth: Set `ENABLE_CREDENTIALS_AUTH=true` and implement logic in `lib/auth/options.ts`

Configuration is managed in `lib/config.ts` - providers are enabled/disabled based on available credentials.

### Customize Sign-In Page

Edit `app/(auth)/signin/page.tsx` to match your brand

### Configure Session

Edit `lib/auth/config.ts` to adjust session duration and callbacks

### Update Components

Customize auth components in `components/auth/` to match your design system

## Production Deployment

1. Switch to PostgreSQL (update `prisma/schema.prisma`)
2. Set `NEXTAUTH_URL` to your production domain
3. Generate new `NEXTAUTH_SECRET` for production
4. Configure OAuth redirect URIs for production domain
5. Enable HTTPS

## Troubleshooting

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
