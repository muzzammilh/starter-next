/**
 * Rate Limiting Middleware
 * 
 * ⚠️ SERVERLESS WARNING:
 * This implementation uses in-memory storage which does NOT work properly
 * in serverless environments (Vercel, AWS Lambda, Netlify Functions, etc.)
 * because each function invocation is stateless.
 * 
 * For serverless deployments, you MUST use an external store like:
 * - Vercel KV (Redis)
 * - Upstash Redis
 * - DynamoDB
 * - Or use Vercel's built-in rate limiting
 * 
 * This implementation is suitable for:
 * - Development/testing
 * - Traditional server deployments (single instance)
 * - Docker containers with persistent state
 * 
 * See docs/api-middleware.md for serverless alternatives.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   * @default 10
   */
  maxRequests?: number;
  
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;
  
  /**
   * Custom message when rate limit is exceeded
   */
  message?: string;
  
  /**
   * Skip rate limiting for certain conditions
   */
  skip?: (request: NextRequest) => boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// ⚠️ WARNING: This will NOT work in serverless environments!
// Each serverless function invocation starts with an empty Map.
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
// ⚠️ WARNING: setInterval may not work reliably in serverless
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Get client identifier from request
 * Uses IP address or fallback to a header
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to unknown (Next.js doesn't expose IP directly in all environments)
  return 'unknown';
}

/**
 * Rate limiting middleware
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const rateLimitResult = await rateLimit(request);
 *   if (rateLimitResult) return rateLimitResult;
 *   
 *   // Your API logic here
 * }
 * ```
 * 
 * @example With custom config
 * ```typescript
 * const rateLimitResult = await rateLimit(request, {
 *   maxRequests: 100,
 *   windowMs: 60000, // 1 minute
 * });
 * ```
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = {}
): Promise<NextResponse | null> {
  const {
    maxRequests = 10,
    windowMs = 60000, // 1 minute
    message = 'Too many requests, please try again later',
    skip,
  } = config;
  
  // Skip rate limiting if condition is met
  if (skip && skip(request)) {
    return null;
  }
  
  const clientId = getClientId(request);
  const now = Date.now();
  const key = `${clientId}:${request.nextUrl.pathname}`;
  
  let entry = rateLimitStore.get(key);
  
  // Create new entry if doesn't exist or window expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  entry.count++;
  
  // Check if limit exceeded
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    
    logger.warn(
      {
        clientId,
        path: request.nextUrl.pathname,
        count: entry.count,
        limit: maxRequests,
      },
      'Rate limit exceeded'
    );
    
    return NextResponse.json(
      {
        error: message,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetTime.toString(),
        },
      }
    );
  }
  
  // Return null to indicate rate limit passed
  // The calling code should add these headers to the response
  return null;
}

/**
 * Get rate limit headers for a successful response
 */
export function getRateLimitHeaders(
  request: NextRequest,
  config: RateLimitConfig = {}
): Record<string, string> {
  const { maxRequests = 10 } = config;
  const clientId = getClientId(request);
  const key = `${clientId}:${request.nextUrl.pathname}`;
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    return {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': maxRequests.toString(),
    };
  }
  
  const remaining = Math.max(0, maxRequests - entry.count);
  
  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': entry.resetTime.toString(),
  };
}
