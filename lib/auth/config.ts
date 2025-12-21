/**
 * NextAuth Configuration
 * 
 * This file contains the core NextAuth configuration.
 * To add/remove auth providers, edit the providers array in options.ts
 * 
 * Learn more: https://authjs.dev/getting-started/installation
 */

import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@lib/db/prisma";
import { authProviders } from "./options";
import "./types"; // Import type extensions

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: authProviders,
  
  pages: {
    signIn: "/signin",
    error: "/signin/error",
  },
  
  session: {
    // Use JWT for credentials provider, database for OAuth
    // Credentials provider doesn't work with database sessions
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Add user ID to token on signin
      if (user) {
        token.id = user.id;
      }

      // Fetch role from database on signin or when token is updated
      if (user || trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role || "user";
      }

      return token;
    },
    async session({ session, token }) {
      // Add user ID and role from token to session
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "user" | "admin" | "manager" | "guest") || "user";
      }
      return session;
    },
  },
  
  // TODO: Configure additional options as needed
  // debug: process.env.NODE_ENV === "development",
};
