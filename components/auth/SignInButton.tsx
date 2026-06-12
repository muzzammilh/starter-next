"use client";

/**
 * Sign In Button Component
 * 
 * Triggers the NextAuth sign-in flow.
 * Customize the button styling to match your design system.
 */

import { signIn } from "next-auth/react";

interface SignInButtonProps {
  provider?: string;
  callbackUrl?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SignInButton({
  provider,
  callbackUrl = "/",
  children = "Sign In",
  className = "",
}: SignInButtonProps) {
  return (
    <button
      onClick={() => signIn(provider, { callbackUrl })}
      className={`cursor-pointer ${className || "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"}`}
    >
      {children}
    </button>
  );
}
