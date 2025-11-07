/**
 * Authentication Providers Configuration
 * 
 * Providers are automatically enabled/disabled based on configuration.
 * See lib/config.ts for provider feature flags.
 * 
 * To enable a provider, set the required environment variables:
 * - OAuth providers: Auto-enabled when credentials are present
 * - Email: Set EMAIL_SERVER and EMAIL_FROM
 * - Credentials: Set ENABLE_CREDENTIALS_AUTH=true and implement authorize logic
 * 
 * Available providers: https://authjs.dev/getting-started/providers
 */

import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import TwitterProvider from "next-auth/providers/twitter";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { config } from "@lib/config";
import { authenticateUser } from "./credentials";

/**
 * Build the providers array based on configuration
 * Only enabled providers are included
 */
const allProviders = [
  // Google OAuth
  // Requires: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  // Setup: https://console.cloud.google.com/apis/credentials
  config.auth.providers.google &&
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

  // Facebook OAuth
  // Requires: FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET
  // Setup: https://developers.facebook.com/apps
  config.auth.providers.facebook &&
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

  // Apple OAuth
  // Requires: APPLE_ID, APPLE_SECRET
  // Setup: https://developer.apple.com/account/resources/identifiers/list/serviceId
  config.auth.providers.apple &&
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),

  // X (Twitter) OAuth
  // Requires: TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET
  // Setup: https://developer.twitter.com/en/portal/dashboard
  config.auth.providers.twitter &&
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),

  // GitHub OAuth
  // Requires: GITHUB_ID, GITHUB_SECRET
  // Setup: https://github.com/settings/developers
  config.auth.providers.github &&
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

  // Email Magic Link
  // Requires: EMAIL_SERVER, EMAIL_FROM
  // Example EMAIL_SERVER: smtp://user:pass@smtp.example.com:587
  config.auth.providers.email &&
    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!,
    }),

  // Custom Credentials (Email/Password)
  // Requires: ENABLE_CREDENTIALS_AUTH=true
  // Implement your own logic in lib/auth/credentials.ts
  config.auth.providers.credentials &&
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@example.com" },
        password: { label: "Password", type: "password", placeholder: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await authenticateUser(
          credentials.email as string,
          credentials.password as string
        );

        return user;
      },
    }),
];

// Filter out disabled providers and export
export const authProviders: NextAuthConfig["providers"] = allProviders.filter(
  (provider): provider is Exclude<typeof provider, false> => provider !== false
);
