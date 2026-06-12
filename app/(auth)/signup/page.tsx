/**
 * Sign Up Page
 * 
 * User registration page for email/password authentication.
 * Only shown when credentials provider is enabled.
 * TODO: Customize the design to match your brand.
 */

import { SignUpForm } from "@/components/auth/SignUpForm";
import { config } from "@lib/config";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function SignUpPage() {
  // Redirect if credentials auth is not enabled
  if (!config.auth.providers.credentials) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{config.app.name}</h1>
          <p className="mt-2 text-gray-800">Create your account</p>
        </div>

        <SignUpForm />

        <p className="text-center text-sm text-gray-700">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>

        <p className="text-center text-sm text-gray-700">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
