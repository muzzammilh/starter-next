/**
 * Email Verification Pending Page
 * 
 * Shows after signup, prompting user to check their email.
 * Allows resending verification email.
 */

import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { config } from "@lib/config";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; verified?: string; error?: string }>;
}) {
  const params = await searchParams;
  const email = params.email;
  const verified = params.verified === "true";
  const error = params.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{config.app.name}</h1>
          
          {verified ? (
            <>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <svg
                  className="w-12 h-12 text-green-600 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-green-900">
                  Email Verified!
                </h2>
                <p className="mt-2 text-green-700">
                  Your email has been successfully verified. You can now sign in.
                </p>
              </div>
              <a
                href="/signin"
                className="mt-6 inline-block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
              >
                Sign In
              </a>
            </>
          ) : error ? (
            <>
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <svg
                  className="w-12 h-12 text-red-600 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-red-900">
                  Verification Failed
                </h2>
                <p className="mt-2 text-red-700">
                  {error === "invalid-verification"
                    ? "The verification link is invalid or has expired."
                    : "An error occurred during verification."}
                </p>
              </div>
              {email && <VerifyEmailForm email={email} />}
            </>
          ) : (
            <>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <svg
                  className="w-12 h-12 text-blue-600 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900">
                  Verify Your Email
                </h2>
                <p className="mt-2 text-gray-600">
                  We've sent a verification link to{" "}
                  <strong>{email || "your email"}</strong>
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Please check your inbox and click the link to verify your account.
                  The link will expire in 24 hours.
                </p>
              </div>
              {email && <VerifyEmailForm email={email} />}
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-600">
          <a href="/signin" className="text-blue-600 hover:text-blue-700">
            Back to Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
