"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Get email from URL params if provided
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await confirmSignUp({
        username: email.trim(),
        confirmationCode: verificationCode.trim()
      });

      setMessage("Email verified successfully! You can now sign in.");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      console.error("Verification error:", err);
      
      if (err.name === "CodeMismatchException") {
        setError("Invalid verification code. Please check the code and try again.");
      } else if (err.name === "ExpiredCodeException") {
        setError("Verification code has expired. Please request a new code.");
      } else if (err.name === "LimitExceededException") {
        setError("Too many attempts. Please wait before trying again.");
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first");
      return;
    }

    setResendLoading(true);
    setError("");
    setMessage("");

    try {
      await resendSignUpCode({
        username: email.trim()
      });
      
      setMessage("New verification code sent to your email!");
    } catch (err: any) {
      console.error("Resend error:", err);
      setError(err.message || "Failed to resend verification code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-abhh-teal-50 to-white">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-abhh-lg border border-abhh-teal-100">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-abhh-yellow-500 rounded-xl flex items-center justify-center mb-4 shadow-abhh">
            <Mail className="h-8 w-8 text-abhh-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-abhh-teal-600 mb-2">
            Verify Your Email
          </h1>
          <p className="text-abhh-teal-500 text-sm">
            Enter the verification code sent to your email to activate your account
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerification} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-abhh-teal-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="block w-full px-4 py-3 border border-abhh-teal-200 rounded-lg shadow-sm placeholder-abhh-teal-400 text-abhh-teal-700 bg-white focus:outline-none focus:ring-2 focus:ring-abhh-teal-500 focus:border-abhh-teal-500 transition-colors"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-abhh-teal-700 mb-2">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
                setError("");
              }}
              className="block w-full px-4 py-3 border border-abhh-teal-200 rounded-lg shadow-sm placeholder-abhh-teal-400 text-abhh-teal-700 bg-white focus:outline-none focus:ring-2 focus:ring-abhh-teal-500 focus:border-abhh-teal-500 transition-colors text-center text-lg tracking-wider"
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
            <p className="text-xs text-abhh-teal-500 mt-1">
              Check your email for a 6-digit verification code
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-abhh-teal-600 hover:bg-abhh-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out shadow-abhh"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              "Verify Email"
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-abhh-teal-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-sm font-medium text-abhh-teal-600 hover:text-abhh-teal-800 transition-colors disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend verification code"}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center pt-4 border-t border-abhh-teal-100">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm text-abhh-teal-600 hover:text-abhh-teal-800 transition-colors"
            >
              ← Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-abhh-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-abhh-yellow-500 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-abhh animate-pulse">
            <div className="w-8 h-8 border-2 border-abhh-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-abhh-teal-600 font-medium">Loading verification page...</p>
        </div>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
}