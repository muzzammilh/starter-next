/**
 * Admin Analytics API
 *
 * GET /api/admin/analytics - Get analytics data
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/api/middleware/auth";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/middleware/error-handler";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    // Require admin role
    const authError = await requireRole(request, "admin");
    if (authError) return authError;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsers, roleDistribution, recentUsers] = await Promise.all([
      // Total user count
      prisma.user.count(),

      // Role distribution
      prisma.user.groupBy({
        by: ["role"],
        _count: { id: true },
      }),

      // Users created in the last 30 days (for signups over time)
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    // Group signups by date
    const signupsByDate = recentUsers.reduce(
      (acc, user) => {
        const date = user.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const signupsOverTime = Object.entries(signupsByDate).map(
      ([date, count]) => ({
        date,
        count,
      })
    );

    return apiSuccess(
      {
        totalUsers,
        roleDistribution: roleDistribution.map((r) => ({
          role: r.role,
          count: r._count.id,
        })),
        signupsOverTime,
        newUsersThisMonth: recentUsers.length,
      },
      "Analytics retrieved successfully"
    );
  } catch (error) {
    logger.error({ error }, "Error fetching analytics");
    return handleApiError(error);
  }
}
