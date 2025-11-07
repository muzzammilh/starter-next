/**
 * Forgot Password API Route
 * 
 * Handles password reset requests.
 * Sends a password reset email with a secure token.
 */

import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@lib/auth/password-reset";
import { sendPasswordResetEmail } from "@lib/email/utils";
import { prisma } from "@lib/db";
import { logger } from "@lib/logger";

export async function POST(request: NextRequest) {
  const requestLogger = logger.child({
    endpoint: "/api/auth/forgot-password",
    requestId: crypto.randomUUID(),
  });

  try {
    const { email } = await request.json();

    if (!email) {
      requestLogger.warn("Email is required");
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    requestLogger.info({ email }, "Password reset requested");

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    // Always return success to prevent email enumeration
    // Don't reveal whether the email exists or not
    if (!user) {
      requestLogger.info({ email }, "User not found (returning success for security)");
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Check if user has a password (credentials auth enabled)
    if (!user.passwordHash) {
      requestLogger.info({ email }, "User has no password (OAuth user)");
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Generate reset token
    requestLogger.debug({ email }, "Generating reset token");
    const token = await createPasswordResetToken(email);

    if (!token) {
      requestLogger.error({ email }, "Failed to generate reset token");
      return NextResponse.json(
        { error: "Failed to generate reset token" },
        { status: 500 }
      );
    }

    // Build reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // Send email
    requestLogger.debug({ email }, "Sending password reset email");
    const emailResult = await sendPasswordResetEmail(
      email,
      resetUrl,
      user.profile?.name || undefined
    );

    if (!emailResult.success) {
      requestLogger.error(
        { email, error: emailResult.error },
        "Failed to send password reset email"
      );
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    requestLogger.info({ email }, "Password reset email sent successfully");
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    requestLogger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Forgot password error"
    );
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
