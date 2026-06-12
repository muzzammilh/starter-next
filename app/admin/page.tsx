/**
 * Admin Index Page
 *
 * Redirects to the admin dashboard.
 */

import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/dashboard");
}
