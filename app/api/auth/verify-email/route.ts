/**
 * Email Verification API Route
 * 
 * Handles email verification via token.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken, markEmailAsVerified } from "@lib/auth/verification";
import { logger } from "@lib/logger";

export async function GET(request: NextRequest) {
  const requestLogger = logger.child({
    endpoint: "/api/auth/verify-email",
    requestId: crypto.randomUUID(),
  });

  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      requestLogger.warn("Missing token or email");
      return NextResponse.redirect(
        new URL("/verify-email?error=invalid-verification", request.url)
      );
    }

    requestLogger.info({ email }, "Email verification attempt");

    const isValid = await verifyEmailToken(email, token);

    if (!isValid) {
      requestLogger.warn({ email }, "Invalid or expired token");
      return NextResponse.redirect(
        new URL(`/verify-email?error=invalid-verification&email=${encodeURIComponent(email)}`, request.url)
      );
    }

    // Mark email as verified
    await markEmailAsVerified(email);

    requestLogger.info({ email }, "Email verified successfully");

    // Redirect to signin with success message
    return NextResponse.redirect(
      new URL("/signin?verified=true", request.url)
    );
  } catch (error) {
    requestLogger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Email verification error"
    );
    return NextResponse.redirect(
      new URL("/signin?error=verification-failed", request.url)
    );
  }
}
