/**
 * Credentials Authentication Logic
 * 
 * Handles email/password authentication.
 * TODO: Customize this for your production use case.
 */

import { prisma } from "@/lib/db";
import { verifyPassword, verifyPasswordDev } from "./password";

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

  // Development mode: Allow test credentials
  if (process.env.NODE_ENV === "development" && verifyPasswordDev(email, password)) {
    // Check if demo user exists, create if not
    let user = await prisma.user.findUnique({
      where: { email: "demo@example.com" },
      include: { profile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "demo@example.com",
          emailVerified: new Date(),
          profile: {
            create: {
              name: "Demo User",
            },
          },
        },
        include: { profile: true },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.profile?.name || null,
      image: user.profile?.image || null,
    };
  }

  // Production mode: Implement your own authentication logic
  // TODO: Replace this with your actual user lookup and password verification
  
  // Example implementation (uncomment and customize):
  /*
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.profile?.name || null,
    image: user.profile?.image || null,
  };
  */

  // For now, return null in production (no credentials auth)
  return null;
}
