/**
 * Resend Verification Email API Route
 * 
 * Allows users to request a new verification email.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { generateVerificationToken } from "@/lib/auth/verification";
import { sendVerificationEmail } from "@/lib/email/utils";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";

const resendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  const requestLogger = logger.child({
    endpoint: "/api/auth/resend-verification",
    requestId: crypto.randomUUID(),
  });

  try {
    const body = await request.json();

    // Validate input
    const validation = resendSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      requestLogger.warn({ error: errorMessage }, "Validation failed");
      return apiError(errorMessage, 400, "VALIDATION_ERROR");
    }

    const { email } = validation.data;
    requestLogger.info({ email }, "Resend verification request");

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      requestLogger.warn({ email }, "User not found");
      return apiSuccess(
        {},
        "If an account exists, a verification email has been sent"
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      requestLogger.info({ email }, "Email already verified");
      return apiError("Email is already verified", 400, "ALREADY_VERIFIED");
    }

    // Generate new verification token
    const token = await generateVerificationToken(email);
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // Send verification email
    const emailResult = await sendVerificationEmail(
      email,
      verificationUrl,
      user.profile?.name || undefined
    );

    if (!emailResult.success) {
      requestLogger.error(
        { error: emailResult.error },
        "Failed to send verification email"
      );
      return apiError("Failed to send verification email", 500, "EMAIL_SEND_FAILED");
    }

    requestLogger.info({ email }, "Verification email sent");

    return apiSuccess({}, "Verification email sent");
  } catch (error) {
    requestLogger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Resend verification error"
    );
    return handleApiError(error);
  }
}
