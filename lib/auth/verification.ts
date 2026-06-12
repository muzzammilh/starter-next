/**
 * Email Verification Utilities
 * 
 * Handles email verification token generation and validation.
 */

import { prisma } from "@lib/db";
import { logger } from "@lib/logger";
import crypto from "crypto";

/**
 * Generate a verification token for email verification
 * @param email - User email address
 * @returns Verification token
 */
export async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Create new verification token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  logger.debug({ email }, "Verification token generated");
  return token;
}

/**
 * Verify an email verification token
 * @param email - User email address
 * @param token - Verification token
 * @returns True if token is valid, false otherwise
 */
export async function verifyEmailToken(
  email: string,
  token: string
): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  });

  if (!verificationToken) {
    logger.warn({ email }, "Invalid verification token");
    return false;
  }

  if (verificationToken.expires < new Date()) {
    logger.warn({ email }, "Verification token expired");
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });
    return false;
  }

  // Delete the token after successful verification
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  });

  logger.info({ email }, "Email verified successfully");
  return true;
}

/**
 * Mark user's email as verified
 * @param email - User email address
 */
export async function markEmailAsVerified(email: string): Promise<void> {
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  logger.info({ email }, "User email marked as verified");
}

/**
 * Check if user's email is verified
 * @param email - User email address
 * @returns True if email is verified, false otherwise
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });

  return user?.emailVerified !== null;
}
