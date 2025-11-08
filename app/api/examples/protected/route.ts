/**
 * Example: Protected API Route
 * 
 * Demonstrates authentication middleware usage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getAuthUser } from '@/lib/api/middleware';

export async function GET(request: NextRequest) {
  // Check authentication
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  // Get authenticated user
  const user = await getAuthUser(request);
  
  return NextResponse.json({
    message: 'This is a protected endpoint',
    user: {
      id: user?.id,
      email: user?.email,
    },
  });
}
