//src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AmplifyProvider } from "@/components/AmplifyProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ABHH Platform - Advanced Business Hiring Hub",
  description: "Streamline your hiring process with ABHH's comprehensive recruitment and interview management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AmplifyProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AmplifyProvider>
      </body>
    </html>
  );
}
