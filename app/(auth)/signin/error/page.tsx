/**
 * Sign In Error Page
 * 
 * Displays authentication errors to users.
 * TODO: Customize error messages and styling.
 */

import Link from "next/link";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  Default: "An error occurred during sign in.",
};

export default async function SignInErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error || "Default";
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">Sign In Error</h1>
          <p className="mt-4 text-gray-600">{errorMessage}</p>
        </div>

        <div className="text-center">
          <Link
            href="/signin"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
