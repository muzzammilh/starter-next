"use client";

/**
 * Session Provider Wrapper
 * 
 * Wraps the NextAuth SessionProvider for client-side session access.
 * This is required for useSession() hook to work in client components.
 */

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
