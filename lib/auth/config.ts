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
import { prisma } from "@/lib/db/prisma";
import { authProviders } from "./options";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: authProviders,
  
  pages: {
    signIn: "/signin",
    error: "/signin/error",
  },
  
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  
  // TODO: Configure additional options as needed
  // debug: process.env.NODE_ENV === "development",
};
