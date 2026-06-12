/**
 * Password Reset Utilities
 * 
 * Handles password reset token generation and validation.
 */

import { prisma } from "@lib/db";
import crypto from "crypto";

const TOKEN_EXPIRY_HOURS = 1;

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a password reset token for a user
 * @param email - User email
 * @returns Token string or null if user not found
 */
export async function createPasswordResetToken(
  email: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  // Invalidate any existing unused tokens
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      used: false,
    },
    data: {
      used: true,
    },
  });

  // Create new token
  const token = generateToken();
  const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Validate a password reset token
 * @param token - Token string
 * @returns User ID if valid, null if invalid/expired
 */
export async function validatePasswordResetToken(
  token: string
): Promise<string | null> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return null;
  }

  // Check if token is expired
  if (resetToken.expires < new Date()) {
    return null;
  }

  // Check if token was already used
  if (resetToken.used) {
    return null;
  }

  return resetToken.userId;
}

/**
 * Mark a password reset token as used
 * @param token - Token string
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true },
  });
}

/**
 * Clean up expired tokens (optional maintenance task)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}
