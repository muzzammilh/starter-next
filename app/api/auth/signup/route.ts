/**
 * Sign Up API Route
 * 
 * Handles user registration with email and password.
 * Creates new user accounts with hashed passwords.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { hashPassword } from "@lib/auth/password";
import { generateVerificationToken } from "@lib/auth/verification";
import { sendVerificationEmail } from "@lib/email/utils";
import { logger } from "@lib/logger";
import { z } from "zod";

// Validation schema
const signUpSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(request: NextRequest) {
  const requestLogger = logger.child({
    endpoint: "/api/auth/signup",
    requestId: crypto.randomUUID(),
  });

  try {
    const body = await request.json();

    // Validate input
    const validation = signUpSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      requestLogger.warn(
        { error: errorMessage },
        "Validation failed"
      );
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;
    requestLogger.info({ email }, "Sign up attempt");

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      requestLogger.warn({ email }, "User already exists");
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    requestLogger.debug("Hashing password");
    const passwordHash = await hashPassword(password);

    // Create user with profile (email NOT verified yet)
    requestLogger.debug({ email, name }, "Creating user");
    const user = await prisma.user.create({
      data: {
        email,
        emailVerified: null, // Not verified yet
        passwordHash,
        profile: {
          create: {
            name,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    requestLogger.info({ userId: user.id, email }, "User created successfully");

    // Generate verification token
    const token = await generateVerificationToken(email);
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // Send verification email
    const emailResult = await sendVerificationEmail(
      email,
      verificationUrl,
      name
    );

    if (!emailResult.success) {
      requestLogger.error(
        { error: emailResult.error },
        "Failed to send verification email"
      );
      // Don't fail signup if email fails, user can resend later
    } else {
      requestLogger.info({ email }, "Verification email sent");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account created! Please check your email to verify your account.",
        user: {
          id: user.id,
          email: user.email,
          name: user.profile?.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    requestLogger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Sign up error"
    );
    return NextResponse.json(
      { error: "An error occurred during sign up" },
      { status: 500 }
    );
  }
}
