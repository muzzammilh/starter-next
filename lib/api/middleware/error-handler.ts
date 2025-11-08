/**
 * Error Handling Middleware
 * 
 * Provides consistent error responses and logging for API routes.
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  meta: {
    timestamp: string;
  };
}

/**
 * Handle API errors and return appropriate response
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   try {
 *     // Your logic here
 *   } catch (error) {
 *     return handleApiError(error);
 *   }
 * }
 * ```
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }
  
  // Zod validation errors
  if (error instanceof ZodError) {
    return handleZodError(error);
  }
  
  // Custom API errors
  if (isApiError(error)) {
    return handleCustomError(error);
  }
  
  // Generic errors
  return handleGenericError(error);
}

/**
 * Handle Prisma database errors
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError
): NextResponse<ErrorResponse> {
  logger.error({ error: error.message, code: error.code }, 'Prisma error');
  
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return NextResponse.json(
        {
          success: false,
          error: 'A record with this value already exists',
          code: 'DUPLICATE_ENTRY',
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 409 }
      );
      
    case 'P2025': // Record not found
      return NextResponse.json(
        {
          success: false,
          error: 'Record not found',
          code: 'NOT_FOUND',
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 404 }
      );
      
    case 'P2003': // Foreign key constraint violation
      return NextResponse.json(
        {
          success: false,
          error: 'Related record not found',
          code: 'INVALID_REFERENCE',
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
      
    default:
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          code: 'DATABASE_ERROR',
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 500 }
      );
  }
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): NextResponse<ErrorResponse> {
  logger.warn({ errors: error.issues }, 'Validation error');
  
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
      meta: { timestamp: new Date().toISOString() },
    },
    { status: 400 }
  );
}

/**
 * Handle custom API errors
 */
function handleCustomError(error: ApiError): NextResponse<ErrorResponse> {
  const statusCode = error.statusCode || 500;
  
  logger.error(
    { error: error.message, code: error.code, statusCode },
    'API error'
  );
  
  return NextResponse.json(
    {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      meta: { timestamp: new Date().toISOString() },
    },
    { status: statusCode }
  );
}

/**
 * Handle generic errors
 */
function handleGenericError(error: unknown): NextResponse<ErrorResponse> {
  const message = error instanceof Error ? error.message : 'Internal server error';
  
  logger.error({ error: message }, 'Unhandled error');
  
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      meta: { timestamp: new Date().toISOString() },
    },
    { status: 500 }
  );
}

/**
 * Type guard for ApiError
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Create a custom API error
 */
export function createApiError(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): ApiError {
  return { message, statusCode, code, details };
}
