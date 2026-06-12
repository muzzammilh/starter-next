/**
 * NextAuth Type Definitions
 * 
 * Extends NextAuth types to include custom fields.
 * Add more fields here as needed for your application.
 */

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    emailVerified?: Date | null;
  }
}
