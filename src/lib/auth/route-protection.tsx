"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

export function useRoleProtection(allowedRoles: string[]) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }

      if (userRole && !allowedRoles.includes(userRole)) {
        router.push("/login");
        return;
      }
    }
  }, [user, userRole, loading, allowedRoles, router]);

  return { user, userRole, loading };
}

// Simplified version without complex generics
export function withRoleProtection(
  WrappedComponent: React.ComponentType<any>,
  allowedRoles: string[]
) {
  const ProtectedComponent = (props: any) => {
    const { user, userRole, loading } = useRoleProtection(allowedRoles);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user || (userRole && !allowedRoles.includes(userRole))) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
            <p className="text-gray-600 mt-2">
              You don&apos;t have permission to access this page.
            </p>
            <button
              onClick={() => {
                window.location.href = "/login";
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  ProtectedComponent.displayName = `withRoleProtection(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return ProtectedComponent;
}

// Component wrapper for route protection
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, userRole, loading } = useRoleProtection(allowedRoles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || (userRole && !allowedRoles.includes(userRole))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
          <p className="text-gray-600 mt-2">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
