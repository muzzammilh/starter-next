/**
 * Reset Password API Route
 * 
 * Handles password reset with a valid token.
 * Updates the user's password and marks the token as used.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  validatePasswordResetToken,
  markTokenAsUsed,
} from "@lib/auth/password-reset";
import { hashPassword } from "@lib/auth/password";
import { prisma } from "@lib/db";
import { logger } from "@lib/logger";

export async function POST(request: NextRequest) {
  const requestLogger = logger.child({
    endpoint: "/api/auth/reset-password",
    requestId: crypto.randomUUID(),
  });

  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      requestLogger.warn("Token and password are required");
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      requestLogger.warn("Password too short");
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    requestLogger.info("Validating reset token");

    // Validate token
    const userId = await validatePasswordResetToken(token);

    if (!userId) {
      requestLogger.warn("Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    requestLogger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Reset password error"
    );
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
