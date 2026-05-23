"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/features/account/auth-provider";

export function AccountGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { cargando, autenticado, error } = useAuth();

  useEffect(() => {
    if (!cargando && !autenticado) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [cargando, autenticado, pathname, router]);

  if (cargando) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Cargando cuenta">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-36 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-36 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {error ?? "Redirigiendo al inicio de sesión…"}
      </p>
    );
  }

  return <>{children}</>;
}
