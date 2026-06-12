/**
 * Request Validation Middleware
 * 
 * Type-safe request validation using Zod schemas.
 * Validates request body, query params, and headers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema } from 'zod';
import { logger } from '@/lib/logger';

export interface ValidationConfig<T = any> {
  /**
   * Zod schema for request body validation
   */
  body?: ZodSchema<T>;
  
  /**
   * Zod schema for query parameters validation
   */
  query?: ZodSchema<any>;
  
  /**
   * Zod schema for headers validation
   */
  headers?: ZodSchema<any>;
}

export interface ValidationResult<T = any> {
  success: boolean;
  data?: {
    body?: T;
    query?: any;
    headers?: any;
  };
  error?: NextResponse;
}

/**
 * Validate request against Zod schemas
 * 
 * @example
 * ```typescript
 * const userSchema = z.object({
 *   email: z.string().email(),
 *   name: z.string().min(2),
 * });
 * 
 * export async function POST(request: NextRequest) {
 *   const validation = await validateRequest(request, { body: userSchema });
 *   if (!validation.success) return validation.error;
 *   
 *   const { email, name } = validation.data.body;
 *   // Your logic here
 * }
 * ```
 */
export async function validateRequest<T = any>(
  request: NextRequest,
  config: ValidationConfig<T>
): Promise<ValidationResult<T>> {
  const result: ValidationResult<T> = {
    success: true,
    data: {},
  };

  try {
    // Validate body
    if (config.body) {
      const body = await request.json().catch(() => ({}));
      const parsed = config.body.safeParse(body);
      
      if (!parsed.success) {
        logger.warn(
          { errors: parsed.error.issues, path: request.nextUrl.pathname },
          'Request body validation failed'
        );
        
        return {
          success: false,
          error: NextResponse.json(
            {
              error: 'Validation failed',
              details: parsed.error.issues.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
            { status: 400 }
          ),
        };
      }
      
      result.data!.body = parsed.data;
    }
    
    // Validate query parameters
    if (config.query) {
      const query = Object.fromEntries(request.nextUrl.searchParams);
      const parsed = config.query.safeParse(query);
      
      if (!parsed.success) {
        logger.warn(
          { errors: parsed.error.issues, path: request.nextUrl.pathname },
          'Query parameters validation failed'
        );
        
        return {
          success: false,
          error: NextResponse.json(
            {
              error: 'Invalid query parameters',
              details: parsed.error.issues.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
            { status: 400 }
          ),
        };
      }
      
      result.data!.query = parsed.data;
    }

    // Validate headers
    if (config.headers) {
      const headers = Object.fromEntries(request.headers);
      const parsed = config.headers.safeParse(headers);
      
      if (!parsed.success) {
        logger.warn(
          { errors: parsed.error.issues, path: request.nextUrl.pathname },
          'Headers validation failed'
        );
        
        return {
          success: false,
          error: NextResponse.json(
            {
              error: 'Invalid headers',
              details: parsed.error.issues.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
            { status: 400 }
          ),
        };
      }
      
      result.data!.headers = parsed.data;
    }
    
    return result;
  } catch (error) {
    logger.error({ error, path: request.nextUrl.pathname }, 'Validation error');
    
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      ),
    };
  }
}
