/**
 * Example: Validated API Route
 * 
 * Demonstrates request validation with Zod schemas.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api/middleware';
import { z } from 'zod';

// Define validation schema
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(18, 'Must be at least 18 years old').optional(),
});

export async function POST(request: NextRequest) {
  // Validate request body
  const validation = await validateRequest(request, {
    body: createUserSchema,
  });
  
  if (!validation.success) {
    return validation.error;
  }
  
  const { email, name, age } = validation.data!.body!;
  
  // Your logic here (e.g., create user in database)
  
  return NextResponse.json({
    message: 'User created successfully',
    data: { email, name, age },
  });
}
