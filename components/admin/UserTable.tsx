"use client";

/**
 * User Table Component
 *
 * Displays a list of users with actions for editing and deleting.
 */

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  createdAt: Date | string;
  profile?: { name: string | null } | null;
}

interface UserTableProps {
  users: User[];
}

const roleBadgeStyles: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  user: "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300",
  guest: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export function UserTable({ users }: UserTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (userId: string, userEmail: string | null) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userEmail || "this user"}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch {
      alert("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        No users found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Email
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Name
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Role
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Created
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="py-3 px-4 text-zinc-900 dark:text-white">
                {user.email || "—"}
              </td>
              <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                {user.profile?.name || user.name || "—"}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${roleBadgeStyles[user.role] || roleBadgeStyles.user}`}
                >
                  {user.role}
                </span>
              </td>
              <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-right space-x-3">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(user.id, user.email)}
                  disabled={deletingId === user.id}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
                >
                  {deletingId === user.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
