/**
 * Admin Layout
 *
 * Wraps all admin pages with sidebar navigation.
 * Authentication and role checks are handled by middleware.
 */

import { redirect } from "next/navigation";
import { getCurrentSession, isAdmin } from "@/lib/auth/utils";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double-check auth (middleware handles this, but defense in depth)
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const admin = await isAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
