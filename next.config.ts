import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable logging in development
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
