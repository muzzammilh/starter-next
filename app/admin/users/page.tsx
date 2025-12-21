/**
 * Admin Users Page
 *
 * Lists all users with search, filtering, and pagination.
 */

import { prisma } from "@/lib/db/prisma";
import { UserTable } from "@/components/admin/UserTable";
import Link from "next/link";
import { Prisma } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;
  const search = params.search || "";
  const roleFilter = params.role || "";

  // Build where clause
  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { profile: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (roleFilter && ["user", "admin", "manager", "guest"].includes(roleFilter)) {
    where.role = roleFilter as "user" | "admin" | "manager" | "guest";
  }

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

  const totalPages = Math.ceil(total / limit);

  // Build query string for pagination links
  const buildQueryString = (newPage: number) => {
    const params = new URLSearchParams();
    params.set("page", newPage.toString());
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    return params.toString();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          User Management
        </h1>
        <span className="text-zinc-500 dark:text-zinc-400">
          {total} user{total !== 1 ? "s" : ""} total
        </span>
      </div>

      {/* Search & Filters */}
      <section className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
        <form className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by email or name..."
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="role"
            defaultValue={roleFilter}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="guest">Guest</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            Search
          </button>
          {(search || roleFilter) && (
            <Link
              href="/admin/users"
              className="px-6 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition text-center font-medium"
            >
              Clear
            </Link>
          )}
        </form>
      </section>

      {/* User Table */}
      <section className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
        <UserTable users={users} />
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/users?${buildQueryString(page - 1)}`}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/users?${buildQueryString(page + 1)}`}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
