/**
 * Example: Standard Response Format
 * 
 * Demonstrates using standard success/error response helpers.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, apiCreated, apiPaginated } from '@/lib/api/response';

// Example 1: Simple success response
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  
  if (type === 'error') {
    // Standard error response
    return apiError('Something went wrong', 500, 'EXAMPLE_ERROR');
  }
  
  if (type === 'paginated') {
    // Paginated response
    const users = [
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' },
    ];
    return apiPaginated(users, 1, 10, 100);
  }
  
  // Standard success response
  return apiSuccess(
    { message: 'Hello from API' },
    'Request successful'
  );
}

// Example 2: Create resource
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Simulate creating a resource
  const newResource = {
    id: '123',
    ...body,
    createdAt: new Date().toISOString(),
  };
  
  // Standard "created" response (201)
  return apiCreated(newResource, 'Resource created successfully');
}

// Example 3: Delete resource
export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  
  if (!id) {
    return apiError('ID is required', 400, 'MISSING_ID');
  }
  
  // Simulate deletion
  return apiSuccess(
    { id, deleted: true },
    'Resource deleted successfully'
  );
}
