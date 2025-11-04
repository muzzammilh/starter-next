/**
 * Application Configuration
 * 
 * Centralized configuration for the application.
 * Values are pulled from environment variables with fallback defaults.
 * 
 * TODO: Update default values for your application
 */

export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Your App Name",
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Your app description",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  auth: {
    providers: {
      // OAuth Providers - Controlled by ENABLE flags
      google: process.env.ENABLE_GOOGLE_AUTH === "true",
      facebook: process.env.ENABLE_FACEBOOK_AUTH === "true",
      apple: process.env.ENABLE_APPLE_AUTH === "true",
      twitter: process.env.ENABLE_TWITTER_AUTH === "true",
      github: process.env.ENABLE_GITHUB_AUTH === "true",
      
      // Email Magic Link
      email: process.env.ENABLE_EMAIL_AUTH === "true",
      
      // Credentials (Email/Password)
      credentials: process.env.ENABLE_CREDENTIALS_AUTH === "true",
    },
  },
  // Add more configuration sections as needed
  // api: {
  //   url: process.env.API_URL || "",
  //   key: process.env.API_KEY || "",
  // },
} as const;
