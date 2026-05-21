"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Ruler,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Resumen", icon: LayoutDashboard },
  { href: "/account/orders", label: "Pedidos", icon: Package },
  { href: "/account/profile", label: "Perfil", icon: User },
  { href: "/account/measurements", label: "Medidas (IA)", icon: Ruler },
];

export function AccountSidebar() {
  const pathname = usePathname();

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
