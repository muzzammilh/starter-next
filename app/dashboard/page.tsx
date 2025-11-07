/**
 * Dashboard Page (Protected Route Example)
 * 
 * This demonstrates how to protect a server component.
 * TODO: Replace with your actual dashboard content.
 */

import { getCurrentUser } from "@lib/auth/utils";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <SignOutButton />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">User Information</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Name:</strong> {user.profile?.name || "Not set"}
                </p>
                <p>
                  <strong>Bio:</strong> {user.profile?.bio || "Not set"}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Connected Accounts</h2>
              <div className="bg-gray-50 p-4 rounded">
                {user.accounts && user.accounts.length > 0 ? (
                  <ul className="space-y-2">
                    {user.accounts.map((account: { id: string; provider: string }) => (
                      <li key={account.id} className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {account.provider}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No connected accounts</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                This is a protected route. Only authenticated users can access
                this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
