/**
 * Prisma Client Instance
 * 
 * This file creates a singleton instance of Prisma Client to prevent
 * multiple instances during development hot-reloading.
 * 
 * Learn more: https://pris.ly/d/help/next-js-best-practices
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
