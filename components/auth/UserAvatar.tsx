"use client";

/**
 * User Avatar Component
 * 
 * Displays user avatar with fallback to initials.
 * TODO: Customize styling to match your design system.
 */

import { useSession } from "next-auth/react";
import Image from "next/image";

interface UserAvatarProps {
  size?: number;
  className?: string;
}

export function UserAvatar({ size = 40, className = "" }: UserAvatarProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user.email?.[0]?.toUpperCase() || "?";

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name || "User"}
          className="rounded-full"
          width={size}
          height={size}
        />
      ) : (
        initials
      )}
    </div>
  );
}
