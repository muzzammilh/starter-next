/**
 * Authentication Middleware
 * 
 * Reusable authentication checks for API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/utils';
import { logger } from '@/lib/logger';

/**
 * Require authentication for an API route
 * Returns error response if not authenticated, null if authenticated
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const authError = await requireAuth(request);
 *   if (authError) return authError;
 *   
 *   // User is authenticated, continue with logic
 * }
 * ```
 */
export async function requireAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  const session = await getCurrentSession();
  
  if (!session || !session.user) {
    logger.warn(
      { path: request.nextUrl.pathname },
      'Unauthorized API access attempt'
    );
    
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return null;
}

/**
 * Get authenticated user from request
 * Returns user if authenticated, null otherwise
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const user = await getAuthUser(request);
 *   if (!user) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   
 *   // Use user data
 * }
 * ```
 */
export async function getAuthUser(request: NextRequest) {
  const session = await getCurrentSession();
  return session?.user || null;
}

/**
 * Require specific role for an API route
 * 
 * @example
 * ```typescript
 * export async function DELETE(request: NextRequest) {
 *   const authError = await requireRole(request, 'admin');
 *   if (authError) return authError;
 *   
 *   // User is admin, continue with logic
 * }
 * ```
 */
export async function requireRole(
  request: NextRequest,
  role: string
): Promise<NextResponse | null> {
  const session = await getCurrentSession();
  
  if (!session || !session.user) {
    logger.warn(
      { path: request.nextUrl.pathname },
      'Unauthorized API access attempt'
    );
    
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Check user role from session
  const userRole = (session.user as any).role || "user";
  
  if (userRole !== role) {
    logger.warn(
      {
        path: request.nextUrl.pathname,
        userId: session.user.id,
        requiredRole: role,
        userRole,
      },
      'Forbidden API access attempt'
    );
    
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  return null;
}
