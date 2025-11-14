/**
 * Credentials Authentication Logic
 * 
 * Handles email/password authentication.
 * Customize this for your production use case (add 2FA, rate limiting, etc.)
 */

import { prisma } from "@lib/db";
import { logger } from "@lib/logger";
import { verifyPassword } from "./password";
import type { User, UserProfile } from "@prisma/client";

/**
 * Authenticate user with email and password
 * @param email - User email
 * @param password - User password
 * @returns User object if valid, null if invalid
 */
export async function authenticateUser(email: string, password: string) {
  // Validate input
  if (!email || !password) {
    logger.warn({ email }, "Authentication attempt with missing credentials");
    return null;
  }

  // Verify user credentials
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  }) as (User & { profile: UserProfile | null }) | null;

  if (!user) {
    logger.warn({ email }, "Authentication failed: user not found");
    return null;
  }

  if (!user.passwordHash) {
    logger.warn({ email, userId: user.id }, "Authentication failed: no password set");
    return null;
  }

  // Check if email is verified
  if (!user.emailVerified) {
    logger.warn({ email, userId: user.id }, "Authentication failed: email not verified");
    // Return null - NextAuth will show generic error
    // Client should check verification status separately
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    logger.warn({ email, userId: user.id }, "Authentication failed: invalid password");
    return null;
  }

  logger.info({ email, userId: user.id }, "Successful authentication");
  return {
    id: user.id,
    email: user.email,
    name: user.profile?.name || null,
    image: user.profile?.image || null,
  };
}
