/**
 * API Configuration
 * 
 * Default configuration for API middleware.
 * Override these in individual routes as needed.
 */

import type { RateLimitConfig, CorsConfig } from './middleware';

/**
 * Default rate limit configuration
 * 
 * TODO: Adjust these values based on your application needs
 */
export const defaultRateLimitConfig: RateLimitConfig = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
};

/**
 * Default CORS configuration
 * 
 * TODO: Update allowedOrigins for production
 */
export const defaultCorsConfig: CorsConfig = {
  allowedOrigins: process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',')
    : [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Rate limit presets for common use cases
 */
export const rateLimitPresets = {
  /**
   * For public endpoints (strict)
   */
  public: {
    maxRequests: 10,
    windowMs: 60000, // 10 requests per minute
  },
  
  /**
   * For authenticated endpoints (moderate)
   */
  authenticated: {
    maxRequests: 100,
    windowMs: 60000, // 100 requests per minute
  },
  
  /**
   * For write operations (limited)
   */
  write: {
    maxRequests: 20,
    windowMs: 60000, // 20 requests per minute
  },
  
  /**
   * For admin endpoints (generous)
   */
  admin: {
    maxRequests: 1000,
    windowMs: 60000, // 1000 requests per minute
  },
} as const;
