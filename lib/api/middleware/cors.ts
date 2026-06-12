/**
 * CORS Middleware
 * 
 * Handles Cross-Origin Resource Sharing for API routes.
 * Configurable allowed origins, methods, and headers.
 */

import { NextRequest, NextResponse } from 'next/server';

export interface CorsConfig {
  /**
   * Allowed origins. Use '*' for all origins (not recommended for production)
   * @default ['http://localhost:3000']
   */
  allowedOrigins?: string[];
  
  /**
   * Allowed HTTP methods
   * @default ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
   */
  allowedMethods?: string[];
  
  /**
   * Allowed headers
   * @default ['Content-Type', 'Authorization']
   */
  allowedHeaders?: string[];
  
  /**
   * Allow credentials (cookies, authorization headers)
   * @default true
   */
  credentials?: boolean;
  
  /**
   * Max age for preflight cache (in seconds)
   * @default 86400 (24 hours)
   */
  maxAge?: number;
}

const DEFAULT_CONFIG: Required<CorsConfig> = {
  allowedOrigins: ['http://localhost:3000'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for a response
 */
export function getCorsHeaders(
  request: NextRequest,
  config: CorsConfig = {}
): Record<string, string> {
  const {
    allowedOrigins,
    allowedMethods,
    allowedHeaders,
    credentials,
    maxAge,
  } = { ...DEFAULT_CONFIG, ...config };
  
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {};
  
  // Set allowed origin
  if (origin && isOriginAllowed(origin, allowedOrigins)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  
  // Set other CORS headers
  if (credentials && !allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  headers['Access-Control-Allow-Methods'] = allowedMethods.join(', ');
  headers['Access-Control-Allow-Headers'] = allowedHeaders.join(', ');
  headers['Access-Control-Max-Age'] = maxAge.toString();
  
  return headers;
}

/**
 * Handle CORS preflight requests (OPTIONS)
 * 
 * @example
 * ```typescript
 * export async function OPTIONS(request: NextRequest) {
 *   return handleCors(request);
 * }
 * ```
 */
export function handleCors(
  request: NextRequest,
  config: CorsConfig = {}
): NextResponse {
  const headers = getCorsHeaders(request, config);
  return new NextResponse(null, { status: 204, headers });
}

/**
 * Apply CORS headers to an existing response
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const data = { message: 'Hello' };
 *   const response = NextResponse.json(data);
 *   return applyCors(request, response);
 * }
 * ```
 */
export function applyCors(
  request: NextRequest,
  response: NextResponse,
  config: CorsConfig = {}
): NextResponse {
  const headers = getCorsHeaders(request, config);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}
