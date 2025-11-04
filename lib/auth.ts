/**
 * NextAuth v5 Configuration
 * 
 * This is the main auth configuration file for NextAuth v5.
 * It exports the auth() function and related utilities.
 * 
 * Learn more: https://authjs.dev/getting-started/installation
 */

import NextAuth from "next-auth";
import { authOptions } from "./auth/config";

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
