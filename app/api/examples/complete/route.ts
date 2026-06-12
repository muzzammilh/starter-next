/**
 * Example: Complete API Route with All Middleware
 * 
 * Demonstrates using the withApiMiddleware wrapper for automatic middleware.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware } from '@/lib/api/utils';
import { validateRequest, requireAuth } from '@/lib/api/middleware';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

// Wrap handler with automatic middleware
export const POST = withApiMiddleware(
  async (request: NextRequest): Promise<NextResponse> => {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) return authError;
    
    // Validate request
    const validation = await validateRequest(request, {
      body: createPostSchema,
    });
    
    if (!validation.success) {
      return validation.error!;
    }
    
    const { title, content } = validation.data!.body!;
    
    // Your business logic here
    // Example: Create a post in database
    // const post = await prisma.post.create({
    //   data: { title, content, authorId: user.id },
    // });
    
    return NextResponse.json({
      message: 'Post created successfully',
      data: { title, content },
    }, { status: 201 });
  },
  {
    // Automatic rate limiting
    rateLimit: {
      maxRequests: 10,
      windowMs: 60000, // 10 requests per minute
    },
    // Automatic CORS
    cors: {
      allowedOrigins: ['http://localhost:3000'],
    },
    // Automatic request/response logging
    logging: {
      logBody: false, // Don't log request body (may contain sensitive data)
    },
  }
);
