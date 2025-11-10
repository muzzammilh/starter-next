/**
 * Authentication Types
 * 
 * Type definitions for authentication and authorization.
 */

import { DefaultSession } from "next-auth";

/**
 * User roles for authorization
 */
export type UserRole = "user" | "admin" | "manager" | "guest";

/**
 * Extended user type with role
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
