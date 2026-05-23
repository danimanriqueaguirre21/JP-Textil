"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Ruler,
  User,
} from "lucide-react";

import { useAuth } from "@/features/account/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Resumen", icon: LayoutDashboard },
  { href: "/account/orders", label: "Pedidos", icon: Package },
  { href: "/account/profile", label: "Perfil", icon: User },
  { href: "/account/measurements", label: "Medidas (IA)", icon: Ruler },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { cerrarSesion } = useAuth();

  return (
    <nav className="space-y-1">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Mi cuenta
      </p>
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900/60",
            )}
          >
            <Icon className="size-4 shrink-0 opacity-80" />
            {label}
          </Link>
        );
      })}
      <Button
        type="button"
        variant="ghost"
        className="mt-4 w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:text-red-700 dark:text-zinc-400 dark:hover:text-red-400"
        onClick={cerrarSesion}
      >
        <LogOut className="size-4 shrink-0 opacity-80" />
        Cerrar sesión
      </Button>
    </nav>
  );
}

export function AccountMobileNav() {
  const pathname = usePathname();
  return (
    <div className="-mx-1 mb-8 flex gap-2 overflow-x-auto pb-1 md:hidden">
      {LINKS.map(({ href, label }) => {
        const active =
          href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
              active
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
