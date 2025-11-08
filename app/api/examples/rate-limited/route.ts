/**
 * Example: Rate Limited API Route
 * 
 * Demonstrates rate limiting middleware.
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitHeaders } from '@/lib/api/middleware';

export async function GET(request: NextRequest) {
  // Apply rate limiting: 5 requests per minute
  const rateLimitResult = await rateLimit(request, {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
  });
  
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  // Your logic here
  const data = { message: 'This endpoint is rate limited' };
  const response = NextResponse.json(data);
  
  // Add rate limit headers to response
  const rateLimitHeaders = getRateLimitHeaders(request, {
    maxRequests: 5,
    windowMs: 60000,
  });
  
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}
