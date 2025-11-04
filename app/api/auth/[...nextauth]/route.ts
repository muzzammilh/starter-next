/**
 * NextAuth API Route Handler
 * 
 * This handles all NextAuth API routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback
 * - /api/auth/session
 * etc.
 * 
 * Do not modify unless you need custom NextAuth behavior.
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
