import { getCurrentUser } from "@lib/auth/utils";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { logger } from "@lib/logger";
import Link from "next/link";

export default async function Home() {
  // Example: Using the logger in a server component
  logger.info("Home page rendered");
  
  const user = await getCurrentUser();
  
  if (user) {
    logger.debug({ userId: user.id }, "User is authenticated");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-900">
      <main className="flex flex-col items-center gap-8 px-8 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Welcome to Your App
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          This is a Next.js boilerplate with authentication. Start building your
          application by editing{" "}
          <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-sm dark:bg-zinc-800">
            app/page.tsx
          </code>
        </p>

        {/* Auth Demo */}
        <div className="flex flex-col items-center gap-4">
          {user ? (
            <>
              <p className="text-zinc-600 dark:text-zinc-400">
                Signed in as <strong>{user.email}</strong>
              </p>
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Go to Dashboard
                </Link>
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <p className="text-zinc-600 dark:text-zinc-400">
                Sign in to access protected features
              </p>
              <SignInButton />
            </>
          )}
        </div>

        {/* TODO: Add your application content here */}
      </main>
    </div>
  );
}
