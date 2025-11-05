import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Example middleware for logging HTTP requests
 * 
 * This is optional and can be customized based on your needs.
 * Add this to your middleware.ts file if you want automatic request logging.
 * 
 * Usage in middleware.ts:
 * ```typescript
 * import { logRequest } from '@/lib/logger/middleware';
 * 
 * export function middleware(request: NextRequest) {
 *   logRequest(request);
 *   // Your other middleware logic
 * }
 * ```
 */
export function logRequest(request: NextRequest) {
  const start = Date.now();
  
  // Create request-specific logger with context
  const requestLogger = logger.child({
    requestId: crypto.randomUUID(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get("user-agent"),
  });

  requestLogger.info("Incoming request");

  // Log response time (you'll need to call this after response)
  return {
    logResponse: (response: NextResponse) => {
      const duration = Date.now() - start;
      requestLogger.info({
        status: response.status,
        duration: `${duration}ms`,
      }, "Request completed");
    },
  };
}

/**
 * Helper to log errors in middleware
 */
export function logMiddlewareError(error: unknown, request: NextRequest) {
  logger.error({
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    method: request.method,
    url: request.url,
  }, "Middleware error");
}
