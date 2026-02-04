/**
 * Forgot Password Page
 * 
 * Allows users to request a password reset email.
 */

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import Link from "next/link";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Forgot Password?</h1>
          <p className="mt-2 text-gray-800">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="text-center text-sm text-gray-700">
          <Link
            href="/signin"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to sign in
          </Link>
        </p>

        <p className="text-center text-sm text-gray-700">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
