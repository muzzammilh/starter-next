/**
 * Example: API Route with CORS
 * 
 * Demonstrates CORS middleware for cross-origin requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyCors, handleCors } from '@/lib/api/middleware';

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleCors(request, {
    allowedOrigins: ['https://example.com', 'http://localhost:3000'],
    allowedMethods: ['GET', 'POST'],
  });
}

export async function GET(request: NextRequest) {
  const data = { message: 'This endpoint supports CORS' };
  const response = NextResponse.json(data);
  
  // Apply CORS headers
  return applyCors(request, response, {
    allowedOrigins: ['https://example.com', 'http://localhost:3000'],
    allowedMethods: ['GET', 'POST'],
  });
}
