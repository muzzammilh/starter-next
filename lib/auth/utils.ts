/**
 * Authentication Utility Functions
 * 
 * Helper functions for working with authentication and user data.
 * These utilities handle the User + UserProfile pattern.
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

/**
 * Get the current session on the server side
 * Use this in Server Components, API routes, and Server Actions
 */
export async function getCurrentSession() {
  return await auth();
}

/**
 * Get the current user with their profile and accounts
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return null;
  }

  return await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      accounts: true,
    },
  });
}

/**
 * Get user by ID with profile
 */
export async function getUserWithProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });
}

/**
 * Create or update user profile
 * Automatically creates profile if it doesn't exist
 */
export async function upsertUserProfile(
  userId: string,
  data: {
    name?: string;
    image?: string;
    bio?: string;
  }
) {
  return await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...data,
    },
    update: data,
  });
}

/**
 * Check if user is authenticated (for use in Server Components)
 */
export async function isAuthenticated() {
  const session = await getCurrentSession();
  return !!session?.user;
}

/**
 * Require authentication - throws error if not authenticated
 * Use this to protect Server Components and API routes
 */
export async function requireAuth() {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  return session;
}
