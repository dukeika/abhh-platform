"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/Logo";

export default function LoginPage() {
  const { signIn, amplifyReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<'error' | 'warning' | 'info'>('error');
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (error: any): { message: string; type: 'error' | 'warning' | 'info' } => {
    const errorName = error.name || '';
    const errorMessage = error.message || '';
    
    console.log('🔍 Login error details:', { name: errorName, message: errorMessage, error });

    // User does not exist
    if (errorName === 'UserNotFoundException' || errorMessage.includes('UserNotFoundException')) {
      return {
        message: `No account found with email "${email}". Please check your email address or create a new account.`,
        type: 'error'
      };
    }

    // Wrong password or credentials
    if (errorName === 'NotAuthorizedException' || errorMessage.includes('NotAuthorizedException')) {
      if (errorMessage.includes('Incorrect username or password')) {
        return {
          message: 'Incorrect password. Please check your password and try again.',
          type: 'error'
        };
      }
      return {
        message: 'Invalid email or password. Please verify your credentials.',
        type: 'error'
      };
    }

    // User needs to confirm their account (email verification)
    if (errorName === 'UserNotConfirmedException' || errorMessage.includes('UserNotConfirmedException')) {
      return {
        message: `Your account needs to be verified. Please check your email for a verification code and verify your account.`,
        type: 'warning'
      };
    }

    // User account is disabled
    if (errorName === 'NotAuthorizedException' && errorMessage.includes('User is disabled')) {
      return {
        message: 'Your account has been disabled. Please contact support for assistance.',
        type: 'error'
      };
    }

    // Too many failed attempts - temporary lockout
    if (errorName === 'TooManyRequestsException' || errorMessage.includes('TooManyRequestsException')) {
      return {
        message: 'Too many failed login attempts. Please wait a few minutes before trying again.',
        type: 'warning'
      };
    }

    // Password reset required
    if (errorName === 'PasswordResetRequiredException' || errorMessage.includes('PasswordResetRequiredException')) {
      return {
        message: 'You must reset your password before signing in. Please use the "Forgot Password" option.',
        type: 'info'
      };
    }

    // User already authenticated elsewhere
    if (errorName === 'UserAlreadyAuthenticatedException' || errorMessage.includes('UserAlreadyAuthenticatedException')) {
      return {
        message: 'You are already signed in. Please refresh the page or sign out first.',
        type: 'info'
      };
    }

    // Network or service errors
    if (errorName === 'NetworkError' || errorMessage.includes('NetworkError')) {
      return {
        message: 'Network error. Please check your internet connection and try again.',
        type: 'error'
      };
    }

    // Generic AWS/Amplify errors
    if (errorName === 'InvalidParameterException') {
      return {
        message: 'Invalid email or password format. Please check your credentials.',
        type: 'error'
      };
    }

    // Unknown error with helpful fallback
    return {
      message: errorMessage || 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      type: 'error'
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
    } finally {
      setLoading(false);
    }
  };

  const getErrorStyles = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-green-50 to-blue-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl border border-teal-100">
        {/* Logo and Brand */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            <Logo size="lg" variant="icon" className="mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ABHH Platform
          </h1>
          <h2 className="text-lg font-semibold text-teal-700 mb-1">
            Applied Behavioral Holistic Health
          </h2>
          <p className="text-gray-600">Empowering Mental Health Recruitment</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`${getErrorStyles(errorType)} px-4 py-3 rounded-lg border`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {errorType === 'error' && (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {errorType === 'warning' && (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {errorType === 'info' && (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {error}
                  </p>
                  {/* Show helpful action buttons for specific error types */}
                  {errorType === 'warning' && error.includes('verified') && (
                    <div className="mt-3 space-y-2">
                      <div>
                        <button
                          type="button"
                          className="text-sm font-medium text-abhh-teal-600 bg-abhh-teal-50 px-3 py-1 rounded hover:bg-abhh-teal-100 focus:outline-none"
                          onClick={() => {
                            const verifyUrl = `/verify?email=${encodeURIComponent(email)}`;
                            window.location.href = verifyUrl;
                          }}
                        >
                          Verify your email →
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="text-sm font-medium underline hover:no-underline focus:outline-none"
                          onClick={() => {
                            alert('Please contact your administrator to resend the verification email.');
                          }}
                        >
                          Need help with verification?
                        </button>
                      </div>
                    </div>
                  )}
                  {errorType === 'error' && error.includes('No account found') && (
                    <div className="mt-3">
                      <Link 
                        href="/register"
                        className="text-sm font-medium underline hover:no-underline focus:outline-none"
                      >
                        Create a new account
                      </Link>
                    </div>
                  )}
                  {errorType === 'info' && error.includes('reset your password') && (
                    <div className="mt-3">
                      <button
                        type="button"
                        className="text-sm font-medium underline hover:no-underline focus:outline-none"
                        onClick={() => {
                          // In a real app, this would navigate to forgot password
                          alert('Forgot password functionality would be implemented here');
                        }}
                      >
                        Reset my password
                      </button>
                    </div>
                  )}
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        errorType === 'error' 
                          ? 'text-red-500 hover:bg-red-100 focus:ring-offset-red-50 focus:ring-red-600'
                          : errorType === 'warning'
                          ? 'text-yellow-600 hover:bg-yellow-100 focus:ring-offset-yellow-50 focus:ring-yellow-600'
                          : 'text-blue-500 hover:bg-blue-100 focus:ring-offset-blue-50 focus:ring-blue-600'
                      }`}
                      onClick={() => setError('')}
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-abhh-teal-700 mb-2"
            >
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
                // Clear error when user starts typing
                if (error) setError('');
              }}
              className="block w-full px-4 py-3 border border-abhh-teal-200 rounded-lg shadow-sm placeholder-abhh-teal-400 text-abhh-teal-700 bg-white focus:outline-none focus:ring-2 focus:ring-abhh-teal-500 focus:border-abhh-teal-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-abhh-teal-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Clear error when user starts typing
                if (error) setError('');
              }}
              className="block w-full px-4 py-3 border border-abhh-teal-200 rounded-lg shadow-sm placeholder-abhh-teal-400 text-abhh-teal-700 bg-white focus:outline-none focus:ring-2 focus:ring-abhh-teal-500 focus:border-abhh-teal-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-abhh-teal-600 hover:bg-abhh-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out shadow-abhh"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing In...
              </div>
            ) : (
              "Sign In to ABHH Platform"
            )}
          </Button>

          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-abhh-teal-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-abhh-teal-500">New to ABHH?</span>
              </div>
            </div>

            <Link
              href="/register"
              className="inline-block font-medium text-abhh-teal-600 hover:text-abhh-teal-800 transition-colors"
            >
              Create an account
            </Link>

            <p className="text-sm text-abhh-teal-600">
              Empowering holistic behavioral health through technology
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
