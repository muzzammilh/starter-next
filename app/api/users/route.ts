/**
 * Users API Route
 * 
 * Example API route demonstrating Prisma database usage.
 * 
 * GET /api/users - List all users
 * POST /api/users - Create a new user
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true, // Include profile data if available
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
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

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
