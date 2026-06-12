/**
 * API Utilities
 * 
 * Helper functions for building API routes with middleware.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  rateLimit,
  getRateLimitHeaders,
  applyCors,
  handleApiError,
  withRequestLogging,
  type RateLimitConfig,
  type CorsConfig,
  type RequestLogConfig,
} from './middleware';

export interface ApiRouteConfig {
  /**
   * Rate limiting configuration
   */
  rateLimit?: RateLimitConfig | false;
  
  /**
   * CORS configuration
   */
  cors?: CorsConfig | false;
  
  /**
   * Request logging configuration
   */
  logging?: RequestLogConfig | false;
}

/**
 * Wrapper for API routes with automatic middleware application
 * 
 * @example
 * ```typescript
 * export const GET = withApiMiddleware(
 *   async (request: NextRequest) => {
 *     return NextResponse.json({ message: 'Hello' });
 *   },
 *   {
 *     rateLimit: { maxRequests: 100, windowMs: 60000 },
 *     cors: { allowedOrigins: ['https://example.com'] },
 *   }
 * );
 * ```
 */
export function withApiMiddleware(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: ApiRouteConfig = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      // Apply rate limiting
      if (config.rateLimit !== false) {
        const rateLimitResult = await rateLimit(request, config.rateLimit);
        if (rateLimitResult) return rateLimitResult;
      }
      
      // Execute handler with logging
      const executeHandler = async () => {
        const response = await handler(request);
        
        // Apply CORS headers
        if (config.cors !== false) {
          applyCors(request, response, config.cors);
        }
        
        // Apply rate limit headers
        if (config.rateLimit !== false) {
          const rateLimitHeaders = getRateLimitHeaders(request, config.rateLimit);
          Object.entries(rateLimitHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }
        
        return response;
      };
      
      if (config.logging !== false) {
        return await withRequestLogging(request, executeHandler, config.logging);
      }
      
      return await executeHandler();
    } catch (error) {
      return handleApiError(error);
    }
  };
}
