/**
 * Standard API Response Helpers
 * 
 * Provides consistent response structures for success and error cases.
 */

import { NextResponse } from 'next/server';

/**
 * Standard success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Create a standard success response
 * 
 * @example
 * ```typescript
 * return apiSuccess({ id: '123', name: 'John' });
 * // Returns: { success: true, data: { id: '123', name: 'John' }, meta: { timestamp: '...' } }
 * ```
 * 
 * @example With message
 * ```typescript
 * return apiSuccess(user, 'User created successfully', 201);
 * ```
 * 
 * @example With pagination metadata
 * ```typescript
 * return apiSuccess(users, undefined, 200, { page: 1, total: 100 });
 * ```
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
  status: number = 200,
  meta?: Record<string, any>
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status }
  );
}

/**
 * Create a standard error response
 * 
 * @example
 * ```typescript
 * return apiError('User not found', 404, 'USER_NOT_FOUND');
 * ```
 */
export function apiError(
  error: string,
  status: number = 500,
  code?: string,
  details?: any
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(code && { code }),
      ...(details && { details }),
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Create a paginated success response
 * 
 * @example
 * ```typescript
 * return apiPaginated(users, 1, 10, 100);
 * // Returns data with pagination metadata
 * ```
 */
export function apiPaginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): NextResponse<SuccessResponse<T[]>> {
  const totalPages = Math.ceil(total / limit);
  
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      meta: {
        timestamp: new Date().toISOString(),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    },
    { status: 200 }
  );
}

/**
 * Create a "no content" success response
 * 
 * @example
 * ```typescript
 * return apiNoContent(); // 204 No Content
 * ```
 */
export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Create a "created" success response
 * 
 * @example
 * ```typescript
 * return apiCreated(newUser, 'User created successfully');
 * ```
 */
export function apiCreated<T>(
  data: T,
  message?: string
): NextResponse<SuccessResponse<T>> {
  return apiSuccess(data, message, 201);
}

/**
 * Create an "accepted" response (for async operations)
 * 
 * @example
 * ```typescript
 * return apiAccepted({ jobId: '123' }, 'Job queued for processing');
 * ```
 */
export function apiAccepted<T>(
  data: T,
  message?: string
): NextResponse<SuccessResponse<T>> {
  return apiSuccess(data, message, 202);
}
