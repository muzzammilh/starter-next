import { prisma } from "@/lib/db/prisma";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentActivityFeed } from "@/components/admin/RecentActivityFeed";
import { Users, Shield, TrendingUp } from "lucide-react";

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
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
  ]);

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
    recentSignups: recentUsers.map(u => ({
      id: u.id,
      title: u.name || u.email || "Unknown",
      subtitle: u.email || "",
      timestamp: u.createdAt,
    })),
  };
}

export default async function AdminDashboardPage() {
  const analytics = await getAnalytics();

  const adminCount =
    analytics.roleDistribution.find((r) => r.role === "admin")?.count || 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-card-foreground">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          System overview and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={analytics.totalUsers}
          icon={<Users className="h-6 w-6 text-primary" />}
        />
        <StatsCard
          title="Admins"
          value={adminCount}
          icon={<Shield className="h-6 w-6 text-primary" />}
        />
        <StatsCard
          title="New This Month"
          value={analytics.newUsersThisMonth}
          subtitle="Last 30 days"
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <section className="rounded-lg border bg-card text-card-foreground p-6">
          <h2 className="text-xl font-semibold mb-4">Role Distribution</h2>
          <div className="space-y-3">
            {analytics.roleDistribution.length === 0 ? (
              <p className="text-muted-foreground">No users yet</p>
            ) : (
              analytics.roleDistribution.map((role) => (
                <div
                  key={role.role}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <span className="capitalize text-card-foreground">
                    {role.role}
                  </span>
                  <span className="font-semibold text-card-foreground">
                    {role.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <RecentActivityFeed
          title="Recent Signups"
          items={analytics.recentSignups}
        />
      </div>

      <section className="rounded-lg border bg-card text-card-foreground p-6">
        <h2 className="text-xl font-semibold mb-4">Signups Over Time</h2>
        {analytics.signupsOverTime.length === 0 ? (
          <p className="text-muted-foreground">
            No signups in the last 30 days
          </p>
        ) : (
          <div className="space-y-2">
            {analytics.signupsOverTime.map((day) => (
              <div
                key={day.date}
                className="flex items-center gap-4 py-2 border-b last:border-0"
              >
                <span className="text-sm text-muted-foreground w-28">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{
                      width: `${Math.min(100, day.count * 10)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-card-foreground w-8 text-right">
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
