"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        // Redirect based on role
        switch (userRole) {
          case "super_admin":
            router.push("/admin/dashboard");
            break;
          case "company_admin":
            router.push("/company/dashboard");
            break;
          case "candidate":
            router.push("/candidate/dashboard");
            break;
          default:
            router.push("/login");
        }
      }
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return null;
}
