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
  // Add more configuration sections as needed
  // api: {
  //   url: process.env.API_URL || "",
  //   key: process.env.API_KEY || "",
  // },
} as const;
