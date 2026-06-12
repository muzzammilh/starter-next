"use client";

/**
 * Sign Out Button Component
 * 
 * Triggers the NextAuth sign-out flow.
 * Customize the button styling to match your design system.
 */

import { signOut } from "next-auth/react";

interface SignOutButtonProps {
  callbackUrl?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SignOutButton({
  callbackUrl = "/",
  children = "Sign Out",
  className = "",
}: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl })}
      className={className || "px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"}
    >
      {children}
    </button>
  );
}
