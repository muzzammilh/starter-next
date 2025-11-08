/**
 * Reset Password API Route
 * 
 * Handles password reset with a valid token.
 * Updates the user's password and marks the token as used.
 */

import { NextRequest } from "next/server";
import {
  validatePasswordResetToken,
  markTokenAsUsed,
} from "@/lib/auth/password-reset";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";

export async function POST(request: NextRequest) {
  const requestLogger = logger.child({
    endpoint: "/api/auth/reset-password",
    requestId: crypto.randomUUID(),
  });

  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      requestLogger.warn("Token and password are required");
      return apiError("Token and password are required", 400, "MISSING_FIELDS");
    }

    // Validate password strength
    if (password.length < 8) {
      requestLogger.warn("Password too short");
      return apiError("Password must be at least 8 characters", 400, "PASSWORD_TOO_SHORT");
    }

    requestLogger.info("Validating reset token");

    // Validate token
    const userId = await validatePasswordResetToken(token);

    if (!userId) {
      requestLogger.warn("Invalid or expired token");
      return apiError("Invalid or expired token", 400, "INVALID_TOKEN");
    }

    requestLogger.debug({ userId }, "Token validated, updating password");

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Mark token as used
    await markTokenAsUsed(token);

    requestLogger.info({ userId }, "Password reset successfully");

    return apiSuccess({}, "Password reset successfully");
  } catch (error) {
    requestLogger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Reset password error"
    );
    return handleApiError(error);
  }
}
