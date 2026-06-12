/**
 * Admin Users API
 *
 * GET /api/admin/users - List users with pagination, search, and filtering
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/api/middleware/auth";
import { apiPaginated } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/middleware/error-handler";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Require admin role
    const authError = await requireRole(request, "admin");
    if (authError) return authError;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { profile: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (role && ["user", "admin", "manager", "guest"].includes(role)) {
      where.role = role as "user" | "admin" | "manager" | "guest";
    }

    // Fetch users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { profile: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return apiPaginated(users, page, limit, total, "Users retrieved successfully");
  } catch (error) {
    logger.error({ error }, "Error fetching admin users");
    return handleApiError(error);
  }
}
