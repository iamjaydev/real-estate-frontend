"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

type UserRole = "customer" | "broker";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export default function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const accessToken = useAuthStore((state) => state.accessToken);
  const userRole = useAuthStore((state) => state.userRole);

  useEffect(() => {
    if (!accessToken) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (userRole !== allowedRole) {
      router.replace(userRole === "broker" ? "/broker" : "/customer");
    }
  }, [accessToken, userRole, allowedRole, pathname, router]);

  if (!accessToken || userRole !== allowedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}
