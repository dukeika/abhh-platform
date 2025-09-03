"use client";

import Image from "next/image";
import { Heart, Brain, Users } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  className?: string;
}

export default function Logo({ size = "md", variant = "full", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: variant === "full" ? "h-8 w-auto" : "h-8 w-8",
    md: variant === "full" ? "h-12 w-auto" : "h-12 w-12",
    lg: variant === "full" ? "h-16 w-auto" : "h-16 w-16",
  };

  const iconSizes = {
    sm: { heart: "h-3 w-3", brain: "h-2.5 w-2.5", users: "h-2.5 w-2.5" },
    md: { heart: "h-5 w-5", brain: "h-4 w-4", users: "h-4 w-4" },
    lg: { heart: "h-7 w-7", brain: "h-6 w-6", users: "h-6 w-6" },
  };

  // Try to load the uploaded logo, fall back to icon design
  const LogoIcon = () => (
    <div className={`
      bg-gradient-to-br from-teal-500 via-green-500 to-blue-500 
      rounded-2xl flex items-center justify-center shadow-xl
      ${sizeClasses[size]} ${className}
    `}>
      <div className="flex items-center space-x-0.5">
        <Heart className={`${iconSizes[size].heart} text-white`} />
        <Brain className={`${iconSizes[size].brain} text-white`} />
        <Users className={`${iconSizes[size].users} text-white`} />
      </div>
    </div>
  );

  // If you have uploaded a logo, uncomment and use this:
  /*
  try {
    return (
      <Image
        src="/logo.png" // Your uploaded logo path
        alt="Applied Behavioral Holistic Health Logo"
        className={`${sizeClasses[size]} ${className}`}
        width={variant === "full" ? 200 : 64}
        height={64}
        priority
      />
    );
  } catch {
    // Fall back to icon if logo file not found
    return <LogoIcon />;
  }
  */

  return <LogoIcon />;
}