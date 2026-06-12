# Database

This boilerplate uses Prisma ORM with support for SQLite (local development) and PostgreSQL (production).

## Features

- 🗄️ **Prisma ORM**: Type-safe database access
- 🚀 **PostgreSQL**: Production-ready database
- 📝 **Migrations**: Version-controlled schema changes
- 🎨 **Prisma Studio**: Visual database editor
- 🌱 **Seeding**: Example data for development

## Quick Start

## Quick Start

### Database Setup (PostgreSQL)

1. Update `DATABASE_URL` in `.env.local` with your PostgreSQL connection string
2. Run migrations: `npm run db:migrate`

## Database Commands

```bash
# Generate Prisma Client (run after schema changes)
npm run db:generate

# Push schema changes to database (for prototyping)
npm run db:push

# Create and run migrations (for production)
npm run db:migrate

# Open Prisma Studio (visual database editor)
npm run db:studio

# Seed database with example data
npm run db:seed
```

## Usage Example

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

// Delete a user
await prisma.user.delete({
  where: { id: user.id },
});
```

## Schema Structure

The database schema is defined in `prisma/schema.prisma`:

```prisma
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Your models here
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  emailVerified DateTime?
  accounts      Account[]
  sessions      Session[]
  profile       UserProfile?
}
```



## Database Migrations

### Development Workflow

Use `db:push` for rapid prototyping:

```bash
# Make changes to schema.prisma
# Then push changes directly to database
npm run db:push
```

### Production Workflow

Use migrations for version control:

```bash
# Create a new migration
npm run db:migrate

# This will:
# 1. Create a migration file in prisma/migrations/
# 2. Apply the migration to your database
# 3. Update Prisma Client
```

### Migration Best Practices

1. **Always create migrations** before deploying to production
2. **Review migration SQL** before applying
3. **Test migrations** on a staging database first
4. **Never edit migration files** after they've been applied
5. **Commit migrations** to version control

## Seeding the Database

The boilerplate includes a seed script at `prisma/seed.ts`.

### Run Seeding

```bash
npm run db:seed
```

### Customize Seed Data

Edit `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create example users
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: 'User One',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: 'User Two',
    },
  });

  console.log({ user1, user2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Prisma Studio

Prisma Studio is a visual database editor:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View and edit data
- Create new records
- Delete records
- Explore relationships

## Common Patterns

### Querying with Relations

```typescript
// Include related data
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true,
    accounts: true,
  },
});

// Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    profile: {
      select: {
        name: true,
        image: true,
      },
    },
  },
});
```

### Filtering and Sorting

```typescript
// Filter users
const users = await prisma.user.findMany({
  where: {
    email: {
      contains: '@example.com',
    },
    emailVerified: {
      not: null,
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
  skip: 0,
});
```

### Transactions

```typescript
// Execute multiple operations atomically
const result = await prisma.$transaction([
  prisma.user.create({ data: { email: 'user@example.com' } }),
  prisma.userProfile.create({ data: { userId: 'user-id', name: 'John' } }),
]);

// Or use interactive transactions
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'user@example.com' } });
  await tx.userProfile.create({ data: { userId: user.id, name: 'John' } });
});
```

### Aggregations

```typescript
// Count users
const count = await prisma.user.count();

// Aggregate data
const stats = await prisma.user.aggregate({
  _count: true,
  _avg: {
    age: true,
  },
});
```

## Error Handling

```typescript
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({
    data: { email: 'duplicate@example.com' },
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      console.error('Email already exists');
    }
  }
  throw error;
}
```

## Connection Pooling

For serverless environments (Vercel, AWS Lambda), use connection pooling:

### Option 1: Prisma Data Proxy

```env
DATABASE_URL="prisma://aws-us-east-1.prisma-data.com/?api_key=..."
```

### Option 2: PgBouncer

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?pgbouncer=true"
```

### Option 3: Prisma Accelerate

```bash
npm install @prisma/extension-accelerate
```

```typescript
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());
```

## Performance Tips

1. **Use indexes** for frequently queried fields:
   ```prisma
   model User {
     email String @unique
     name  String
     
     @@index([name])
   }
   ```

2. **Select only needed fields**:
   ```typescript
   const users = await prisma.user.findMany({
     select: { id: true, email: true },
   });
   ```

3. **Use pagination** for large datasets:
   ```typescript
   const users = await prisma.user.findMany({
     take: 20,
     skip: page * 20,
   });
   ```

4. **Batch operations** when possible:
   ```typescript
   await prisma.user.createMany({
     data: [{ email: 'user1@example.com' }, { email: 'user2@example.com' }],
   });
   ```

## Troubleshooting

### "Prisma Client not generated"
```bash
npm run db:generate
```

### "Database does not exist"
```bash
npm run db:push
```

### "Migration failed"
- Check your database connection
- Verify DATABASE_URL is correct
- Review migration SQL for errors
- Try resetting: `npx prisma migrate reset`

### "Connection pool timeout"
- Increase connection pool size in DATABASE_URL
- Use connection pooling (PgBouncer, Prisma Data Proxy)
- Check for connection leaks (always disconnect)

## Best Practices

1. **Always use Prisma Client** - Don't write raw SQL unless necessary
2. **Handle errors gracefully** - Catch and log database errors
3. **Use transactions** for related operations
4. **Index frequently queried fields** for better performance
5. **Validate data** before database operations
6. **Use migrations** in production, `db:push` in development
7. **Close connections** in serverless environments
8. **Monitor query performance** with Prisma's logging

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Database Connectors](https://www.prisma.io/docs/concepts/database-connectors)
