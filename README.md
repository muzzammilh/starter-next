# Next.js Boilerplate

A modern, production-ready Next.js boilerplate with TypeScript, Tailwind CSS, and Prisma.

## Features

- ⚡️ Next.js 16 with App Router
- 🎨 Tailwind CSS 4
- 📘 TypeScript
- 🗄️ Prisma ORM with SQLite/PostgreSQL support
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
├── app/                # Next.js app directory
│   ├── layout.tsx     # Root layout with metadata
│   ├── page.tsx       # Home page
│   └── globals.css    # Global styles
├── lib/               # Shared utilities and configuration
│   ├── db/           # Database client and exports
│   │   ├── index.ts  # Database exports
│   │   └── prisma.ts # Prisma client instance
│   └── config.ts     # App configuration
├── prisma/            # Database schema and migrations
│   ├── schema.prisma # Database schema definition
│   └── seed.ts       # Database seed script
├── public/            # Static assets
├── data/              # Local database files (SQLite)
├── .env.example       # Environment variables template
└── .env.local         # Your local environment variables (create this)
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

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## License

See [LICENSE](LICENSE) file for details.
