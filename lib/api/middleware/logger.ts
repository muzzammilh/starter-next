/**
 * Request Logging Middleware
 * 
 * Automatically logs API requests and responses with timing information.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export interface RequestLogConfig {
  /**
   * Skip logging for certain paths
   */
  skipPaths?: string[];
  
  /**
   * Log request body (be careful with sensitive data)
   * @default false
   */
  logBody?: boolean;
  
  /**
   * Log response body (be careful with sensitive data)
   * @default false
   */
  logResponse?: boolean;
}

/**
 * Log API request
 */
export function logRequest(
  request: NextRequest,
  config: RequestLogConfig = {}
): void {
  const { skipPaths = [], logBody = false } = config;
  
  const path = request.nextUrl.pathname;
  
  // Skip logging for certain paths
  if (skipPaths.some((skip) => path.startsWith(skip))) {
    return;
  }
  
  const logData: any = {
    method: request.method,
    path,
    query: Object.fromEntries(request.nextUrl.searchParams),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent'),
  };
  
  // Optionally log request body (be careful with sensitive data)
  if (logBody && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
    // Note: This consumes the request body, so you'll need to clone it
    logData.body = '[body logging not implemented - would consume stream]';
  }
  
  logger.info(logData, 'API request');
}

/**
 * Log API response with timing
 */
export function logResponse(
  request: NextRequest,
  response: NextResponse,
  startTime: number,
  config: RequestLogConfig = {}
): void {
  const { skipPaths = [] } = config;
  
  const path = request.nextUrl.pathname;
  
  // Skip logging for certain paths
  if (skipPaths.some((skip) => path.startsWith(skip))) {
    return;
  }
  
  const duration = Date.now() - startTime;
  
  const logData = {
    method: request.method,
    path,
    status: response.status,
    duration: `${duration}ms`,
  };
  
  if (response.status >= 500) {
    logger.error(logData, 'API response error');
  } else if (response.status >= 400) {
    logger.warn(logData, 'API response client error');
  } else {
    logger.info(logData, 'API response');
  }
}

/**
 * Wrapper to time API route execution
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   return withRequestLogging(request, async () => {
 *     // Your logic here
 *     return NextResponse.json({ data: 'hello' });
 *   });
 * }
 * ```
 */
export async function withRequestLogging(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  config: RequestLogConfig = {}
): Promise<NextResponse> {
  const startTime = Date.now();
  
  logRequest(request, config);
  
  try {
    const response = await handler();
    logResponse(request, response, startTime, config);
    return response;
  } catch (error) {
    logger.error(
      {
        method: request.method,
        path: request.nextUrl.pathname,
        error,
        duration: `${Date.now() - startTime}ms`,
      },
      'API request failed'
    );
    throw error;
  }
}
