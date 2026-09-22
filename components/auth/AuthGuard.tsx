"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

type UserRole = "customer" | "broker";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole | UserRole[];
}

export default function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasHydrated, setHasHydrated] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const userRole = useAuthStore((state) => state.userRole);

  useEffect(() => {
    const unsubHydrate = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return () => unsubHydrate();
  }, []);

  const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  const isAuthorized = userRole !== null && roles.includes(userRole);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!accessToken) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isAuthorized) {
      router.replace(userRole === "broker" ? "/broker" : "/customer");
    }
  }, [hasHydrated, accessToken, isAuthorized, userRole, pathname, router]);

  if (!hasHydrated || !accessToken || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}
