"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

const NAV_LINKS = [
  { href: "/catalog", label: "Catálogo" },
  { href: "/category/oversize", label: "Oversize" },
  { href: "/category/buzo-baggy", label: "Buzos Baggy" },
  { href: "/category/hoodie", label: "Hoodies" },
  { href: "/try-on", label: "Probador IA", highlight: true },
];

export function Navbar() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menú"
              onClick={() => {
                const el = document.getElementById("mobile-menu");
                if (!el) return;
                el.dataset.open = el.dataset.open === "true" ? "false" : "true";
              }}
            >
              <Menu />
            </Button>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.22em] uppercase text-zinc-900 dark:text-zinc-50 sm:text-sm"
          >
            JotaPe Textil
          </Link>
          <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  l.highlight
                    ? "rounded-full border border-zinc-900 px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white dark:border-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-50 dark:hover:text-zinc-900"
                    : "text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" aria-label="Buscar" asChild>
            <Link href="/search">
              <Search />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Mi cuenta" asChild>
            <Link href="/account">
              <User />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Bolsa de compras"
            asChild
            className="relative"
          >
            <Link href="/cart">
              <ShoppingBag />
              <span
                className={`absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-medium text-white dark:bg-zinc-50 dark:text-zinc-900 ${itemCount === 0 ? "hidden" : ""}`}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <div
        id="mobile-menu"
        data-open="false"
        className="border-t border-zinc-100 dark:border-zinc-900 lg:hidden data-[open=false]:hidden"
      >
        <div className="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-xl px-3 py-3 text-sm text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-900/50"
              onClick={() => {
                const el = document.getElementById("mobile-menu");
                if (!el) return;
                el.dataset.open = "false";
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/category/crop"
            className="block rounded-xl px-3 py-3 text-sm text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-900/50"
            onClick={() => {
              const el = document.getElementById("mobile-menu");
              if (!el) return;
              el.dataset.open = "false";
            }}
          >
            Crop
          </Link>
          <Link
            href="/category/estampada"
            className="block rounded-xl px-3 py-3 text-sm text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-900/50"
            onClick={() => {
              const el = document.getElementById("mobile-menu");
              if (!el) return;
              el.dataset.open = "false";
            }}
          >
            Estampadas
          </Link>
          <Link
            href="/login"
            className="block rounded-xl px-3 py-3 text-sm text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-900/50"
            onClick={() => {
              const el = document.getElementById("mobile-menu");
              if (!el) return;
              el.dataset.open = "false";
            }}
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
