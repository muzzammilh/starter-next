/**
 * Admin Edit User Page
 *
 * Form to edit user details including role, name, and email.
 */

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { EditUserForm } from "./EditUserForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      accounts: {
        select: {
          id: true,
          provider: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
        Edit User
      </h1>

      <EditUserForm user={user} />

      {/* Connected Accounts Info */}
      {user.accounts.length > 0 && (
        <section className="mt-8 bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Connected Accounts
          </h2>
          <div className="space-y-2">
            {user.accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <span className="capitalize">{account.provider}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
