import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { getCurrentUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleAdminButton } from "@/components/admin/ToggleAdminButton";

export default async function UsersManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  // Await searchParams (Next.js 15+)
  const params = await searchParams;

  // Build where clause for filtering
  const where: Record<string, unknown> = {};
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.role) {
    where.role = params.role;
  }

  // Fetch users
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      profile: true,
    },
    take: 50,
  });

  const totalUsers = await prisma.user.count({ where });

  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">User Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalUsers} total user{totalUsers !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <form action="/admin/users" method="get">
                <Input
                  type="search"
                  name="search"
                  placeholder="Search by name or email..."
                  defaultValue={params.search}
                  className="pl-10"
                />
              </form>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/users"
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-input bg-card hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors duration-150"
              >
                All Users
              </Link>
              <Link
                href="/admin/users?role=admin"
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-input bg-card hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors duration-150"
              >
                Admins
              </Link>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-card-foreground">
                              {(u.name || u.email || '?')[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-card-foreground">
                              {u.name || 'No name'}
                            </div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={u.role === 'admin' ? 'default' : 'secondary'}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <ToggleAdminButton
                            userId={u.id}
                            userEmail={u.email || ''}
                            isAdmin={u.role === 'admin'}
                            isCurrentUser={u.id === user.id}
                          />
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted hover:bg-accent border transition-colors duration-150"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-foreground">View</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
