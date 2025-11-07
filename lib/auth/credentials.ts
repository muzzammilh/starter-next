/**
 * Credentials Authentication Logic
 * 
 * Handles email/password authentication.
 * TODO: Customize this for your production use case.
 */

import { prisma } from "@lib/db";
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
    return null;
  }

  // Verify user credentials
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  }) as (User & { profile: UserProfile | null }) | null;

  if (!user) {
    console.log(`[Auth] User not found: ${email}`);
    return null;
  }

  if (!user.passwordHash) {
    console.log(`[Auth] User has no password: ${email}`);
    return null;
  }

  // Check if email is verified
  if (!user.emailVerified) {
    console.log(`[Auth] Email not verified: ${email}`);
    // Return null - NextAuth will show generic error
    // Client should check verification status separately
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    console.log(`[Auth] Invalid password for: ${email}`);
    return null;
  }

  console.log(`[Auth] Successful authentication: ${email}`);
  return {
    id: user.id,
    email: user.email,
    name: user.profile?.name || null,
    image: user.profile?.image || null,
  };
}
