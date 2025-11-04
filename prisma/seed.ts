/**
 * Database Seed Script
 * 
 * This script populates the database with initial data.
 * Run with: npm run db:seed
 * 
 * TODO: Customize seed data for your application
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Example: Create a test user with profile
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      profile: {
        create: {
          name: 'Test User',
          bio: 'A test user for development',
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log('✅ Created user with profile:', user);

  // Add more seed data as needed
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
