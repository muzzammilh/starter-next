"use client";

/**
 * Verify Email Form Component
 * 
 * Allows users to resend verification email.
 */

import { useState } from "react";

interface VerifyEmailFormProps {
  email: string;
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Resend verification failed:", data.error);
        setError(data.error || "Failed to resend verification email");
      } else {
        console.log("Verification email resent successfully");
        setMessage("Verification email sent! Please check your inbox.");
      }
    } catch (err) {
      console.error("Resend verification error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {message && (
        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
          {message}
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleResend}
        disabled={loading}
        className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? "Sending..." : "Resend Verification Email"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Didn't receive the email? Check your spam folder or click above to resend.
      </p>
    </div>
  );
}
