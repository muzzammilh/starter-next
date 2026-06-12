/**
 * Reset Password Page
 * 
 * Allows users to set a new password using a reset token.
 */

import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import Link from "next/link";

export const metadata = {
  title: "Reset Password",
  description: "Create a new password",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="mt-2 text-gray-600">
            Enter your new password below
          </p>
        </div>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm text-gray-600">
          <Link
            href="/signin"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
