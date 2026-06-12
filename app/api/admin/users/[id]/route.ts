/**
 * Admin User API
 *
 * GET    /api/admin/users/:id - Get user details
 * PATCH  /api/admin/users/:id - Update user (role, name, email)
 * DELETE /api/admin/users/:id - Delete user
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole, getAuthUser } from "@/lib/api/middleware/auth";
import { apiSuccess, apiError, apiNoContent } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/middleware/error-handler";
import { logger } from "@/lib/logger";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["user", "admin", "manager", "guest"]).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authError = await requireRole(request, "admin");
    if (authError) return authError;

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        accounts: {
          select: {
            id: true,
            provider: true,
            type: true,
          },
        },
      },
    });

    if (!user) {
      return apiError("User not found", 404, "USER_NOT_FOUND");
    }

    return apiSuccess(user, "User retrieved successfully");
  } catch (error) {
    logger.error({ error }, "Error fetching user");
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authError = await requireRole(request, "admin");
    if (authError) return authError;

    const { id } = await params;

    // Parse and validate body
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        validation.error.flatten().fieldErrors
      );
    }

    const { role, name, email } = validation.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return apiError("User not found", 404, "USER_NOT_FOUND");
    }

    // Check email uniqueness if changing
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return apiError("Email already in use", 400, "EMAIL_EXISTS");
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(email && { email }),
        ...(name !== undefined && {
          name,
          profile: {
            upsert: {
              create: { name },
              update: { name },
            },
          },
        }),
      },
      include: { profile: true },
    });

    return apiSuccess(user, "User updated successfully");
  } catch (error) {
    logger.error({ error }, "Error updating user");
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authError = await requireRole(request, "admin");
    if (authError) return authError;

    const { id } = await params;

    // Get current user to prevent self-deletion
    const currentUser = await getAuthUser(request);
    if (currentUser?.id === id) {
      return apiError(
        "Cannot delete your own account",
        400,
        "SELF_DELETE_NOT_ALLOWED"
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return apiError("User not found", 404, "USER_NOT_FOUND");
    }

    // Delete user (cascades to related records)
    await prisma.user.delete({ where: { id } });

    return apiNoContent();
  } catch (error) {
    logger.error({ error }, "Error deleting user");
    return handleApiError(error);
  }
}
