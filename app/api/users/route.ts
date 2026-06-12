/**
 * Users API Route
 * 
 * Example API route demonstrating Prisma database usage.
 * 
 * GET /api/users - List all users
 * POST /api/users - Create a new user
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { apiSuccess, apiCreated, apiError, handleApiError } from '@/lib/api';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true, // Include profile data if available
      },
    });
    
    return apiSuccess(users, 'Users retrieved successfully');
  } catch (error) {
    logger.error({ error }, 'Error fetching users');
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return apiError('Email is required', 400, 'MISSING_EMAIL');
    }

    // Create user with optional profile
    const user = await prisma.user.create({
      data: {
        email,
        profile: name ? {
          create: {
            name,
          },
        } : undefined,
      },
      include: {
        profile: true,
      },
    });

    return apiCreated(user, 'User created successfully');
  } catch (error) {
    logger.error({ error }, 'Error creating user');
    return handleApiError(error);
  }
}
