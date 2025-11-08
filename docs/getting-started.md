# Getting Started

Get your Next.js application up and running in minutes.

## Prerequisites

- Node.js 20+ and npm

## Installation

### 1. Clone or Use This Template

Clone the repository or use it as a template for your new project.

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration values. At minimum, you'll need:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
DATABASE_URL="file:./data/local.db"

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Enable email/password auth for testing
ENABLE_CREDENTIALS_AUTH="true"
```

### 4. Set Up the Database

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:push

# (Optional) Seed with example data
npm run db:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## What's Next?

Now that your app is running, here are some next steps:

### Configure Authentication

Visit the [Authentication Guide](./authentication.md) to:
- Set up OAuth providers (Google, GitHub, etc.)
- Configure email/password authentication
- Customize the sign-in page

### Set Up Email

Visit the [Email Guide](./email.md) to:
- Choose an email provider (Resend, SendGrid, SMTP)
- Configure email templates
- Test email sending

### Explore the Database

Visit the [Database Guide](./database.md) to:
- Learn about Prisma ORM
- Create custom models
- Run migrations

### Configure Logging

Visit the [Logging Guide](./logging.md) to:
- Understand the logging system
- Configure log levels
- Set up file logging

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
│   ├── db/                 # Database client
│   ├── email/              # Email system
│   ├── logger/             # Logging utilities
│   └── config.ts           # App configuration
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma       # Database schema definition
│   └── seed.ts             # Database seed script
├── docs/                    # Documentation
├── public/                  # Static assets
├── data/                    # Local database files (SQLite)
├── .env.example             # Environment variables template
└── .env.local               # Your local environment variables
```

## Available Scripts

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

### Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Open Prisma Studio (visual database editor)
npm run db:studio

# Seed database with data
npm run db:seed
```

## Quick Examples

### Create a Protected Page

```tsx
// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.email}!</p>
    </div>
  );
}
```

### Query the Database

```typescript
import { prisma } from '@/lib/db';

// Get all users
const users = await prisma.user.findMany();

// Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});
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
logger.error({ error }, 'Failed to process payment');
```

## Customization

### Update App Metadata

Edit `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your app description",
};
```

### Configure Environment

Update `.env.local` with your values:

```env
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_APP_URL="https://yourapp.com"
```

### Customize Styling

The boilerplate uses Tailwind CSS. Edit:
- `app/globals.css` - Global styles
- `tailwind.config.ts` - Tailwind configuration

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

The boilerplate works on any platform that supports Next.js:
- [Netlify](https://netlify.com)
- [Railway](https://railway.app)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Google Cloud Run](https://cloud.google.com/run)

### Production Checklist

- [ ] Switch to PostgreSQL (update `prisma/schema.prisma`)
- [ ] Set production environment variables
- [ ] Configure OAuth redirect URIs for production domain
- [ ] Set up email provider
- [ ] Enable HTTPS
- [ ] Configure logging for production
- [ ] Test all features in production environment

## Getting Help

- Check the [documentation](../README.md)
- Review the [examples](../app/examples/)
- Open an issue on GitHub

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
