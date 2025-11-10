/**
 * Rate Limiting for Vercel (Serverless)
 * 
 * This is an EXAMPLE implementation using Vercel KV.
 * To use this:
 * 1. Install: npm install @vercel/kv
 * 2. Set up Vercel KV in your Vercel project
 * 3. Replace the import in your API routes
 * 4. Rename this file to rate-limit.ts (backup the original)
 * 
 * See: https://vercel.com/docs/storage/vercel-kv
 */

import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface RateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
  message?: string;
  skip?: (request: NextRequest) => boolean;
}

function getClientId(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = {}
): Promise<NextResponse | null> {
  const {
    maxRequests = 10,
    windowMs = 60000,
    message = 'Too many requests, please try again later',
    skip,
  } = config;
  
  if (skip && skip(request)) {
    return null;
  }
  
  const clientId = getClientId(request);
  const key = `rate-limit:${clientId}:${request.nextUrl.pathname}`;
  
  try {
    // Increment counter
    const count = await kv.incr(key);
    
    // Set expiry on first request
    if (count === 1) {
      await kv.expire(key, Math.ceil(windowMs / 1000));
    }
    
    // Check if limit exceeded
    if (count > maxRequests) {
      const ttl = await kv.ttl(key);
      
      logger.warn(
        {
          clientId,
          path: request.nextUrl.pathname,
          count,
          limit: maxRequests,
        },
        'Rate limit exceeded'
      );
      
      return NextResponse.json(
        {
          error: message,
          retryAfter: ttl,
        },
        {
          status: 429,
          headers: {
            'Retry-After': ttl.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + ttl * 1000).toString(),
          },
        }
      );
    }
    
    return null;
  } catch (error) {
    // If KV fails, log error but don't block the request
    logger.error({ error }, 'Rate limiting failed');
    return null;
  }
}

export function getRateLimitHeaders(
  request: NextRequest,
  config: RateLimitConfig = {}
): Record<string, string> {
  const { maxRequests = 10 } = config;
  
  // Note: Getting current count from KV would require an async call
  // For simplicity, return basic headers
  return {
    'X-RateLimit-Limit': maxRequests.toString(),
  };
}
