/**
 * Admin Dashboard Page
 *
 * Displays analytics overview with user stats and signup trends.
 */

import { prisma } from "@/lib/db/prisma";
import { StatsCard } from "@/components/admin/StatsCard";

async function getAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, roleDistribution, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
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

  return {
    totalUsers,
    roleDistribution: roleDistribution.map((r) => ({
      role: r.role,
      count: r._count.id,
    })),
    signupsOverTime: Object.entries(signupsByDate).map(([date, count]) => ({
      date,
      count,
    })),
    newUsersThisMonth: recentUsers.length,
  };
}

export default async function AdminDashboardPage() {
  const analytics = await getAnalytics();

  const adminCount =
    analytics.roleDistribution.find((r) => r.role === "admin")?.count || 0;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
        Analytics Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Users" value={analytics.totalUsers} />
        <StatsCard title="Admins" value={adminCount} />
        <StatsCard
          title="New This Month"
          value={analytics.newUsersThisMonth}
          subtitle="Last 30 days"
        />
      </div>

      {/* Role Distribution */}
      <section className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
          Role Distribution
        </h2>
        <div className="space-y-3">
          {analytics.roleDistribution.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400">No users yet</p>
          ) : (
            analytics.roleDistribution.map((role) => (
              <div
                key={role.role}
                className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-700 last:border-0"
              >
                <span className="text-zinc-700 dark:text-zinc-300 capitalize">
                  {role.role}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {role.count}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Signups Over Time */}
      <section className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
          Signups Over Time
        </h2>
        {analytics.signupsOverTime.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">
            No signups in the last 30 days
          </p>
        ) : (
          <div className="space-y-2">
            {analytics.signupsOverTime.map((day) => (
              <div
                key={day.date}
                className="flex items-center gap-4 py-2 border-b border-zinc-100 dark:border-zinc-700 last:border-0"
              >
                <span className="text-sm text-zinc-500 dark:text-zinc-400 w-28">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, day.count * 10)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-white w-8 text-right">
                  {day.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
