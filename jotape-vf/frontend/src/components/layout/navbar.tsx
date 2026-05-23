"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, Sparkles, User, X } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/tendencias", label: "Tendencias" },
  { href: "/hombre", label: "Hombre" },
  { href: "/mujer", label: "Mujer" },
  { href: "/try-on", label: "Probador IA" },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const iconBtnClass =
  "rounded-full text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50";

const tryOnBtnClass = cn(
  "ml-1 hidden rounded-full bg-zinc-900 px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-white sm:ml-2 sm:inline-flex",
  "shadow-[0_6px_24px_-6px_rgba(0,0,0,0.28)]",
  "transition-all duration-300 hover:scale-[1.04]",
  "hover:bg-zinc-800 hover:shadow-[0_10px_32px_-8px_rgba(0,0,0,0.32),0_0_28px_-6px_rgba(168,85,247,0.22)]",
  "dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
  "dark:hover:shadow-[0_10px_32px_-8px_rgba(0,0,0,0.2),0_0_28px_-6px_rgba(168,85,247,0.18)]",
);

type NavLinkProps = {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
  className?: string;
};

function NavLink({ href, label, active, onNavigate, className }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300",
        active
          ? "text-zinc-900 dark:text-zinc-50"
          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
        className,
      )}
    >
      {label}
      <span
        className={cn(
          "absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-zinc-900 transition-transform duration-300 ease-out dark:bg-zinc-50",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        )}
        aria-hidden
      />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tieneSesion, setTieneSesion] = useState(false);

  useEffect(() => {
    let activo = true;
    void authService
      .tieneSesion()
      .then((ok) => {
        if (activo) setTieneSesion(ok);
      })
      .catch(() => {
        if (activo) setTieneSesion(false);
      });
    return () => {
      activo = false;
    };
  }, [pathname]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-zinc-200/50",
        "bg-white/72 backdrop-blur-xl backdrop-saturate-150",
        "supports-[backdrop-filter]:bg-white/60",
        "dark:border-zinc-800/50 dark:bg-zinc-950/72 dark:supports-[backdrop-filter]:bg-zinc-950/60",
      )}
    >
      <div className="jp-container">
        <div className="grid h-[4.25rem] grid-cols-[auto_1fr_auto] items-center gap-3 lg:grid-cols-[1fr_auto_1fr] lg:h-16">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={cn(iconBtnClass, "lg:hidden")}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="h-[1.15rem] w-[1.15rem]" />
              ) : (
                <Menu className="h-[1.15rem] w-[1.15rem]" />
              )}
            </Button>
            <Link
              href="/"
              className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-900 transition-opacity hover:opacity-80 dark:text-zinc-50 sm:text-xs"
            >
              JotaPe Textil
            </Link>
          </div>

          <nav
            className="hidden items-center justify-center gap-7 lg:flex xl:gap-9"
            aria-label="Principal"
          >
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                active={isNavActive(pathname, l.href)}
              />
            ))}
          </nav>

          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buscar"
              asChild
              className={iconBtnClass}
            >
              <Link href="/search">
                <Search className="h-[1.15rem] w-[1.15rem]" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={tieneSesion ? "Mi cuenta" : "Iniciar sesión"}
              asChild
              className={iconBtnClass}
            >
              <Link href={tieneSesion ? "/account" : "/login"}>
                <User className="h-[1.15rem] w-[1.15rem]" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Favoritos"
              asChild
              className={iconBtnClass}
            >
              <Link href="/catalog">
                <Heart className="h-[1.15rem] w-[1.15rem]" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Bolsa de compras"
              asChild
              className={cn(iconBtnClass, "relative")}
            >
              <Link href="/cart">
                <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
                <span
                  className={cn(
                    "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-medium text-white dark:bg-zinc-50 dark:text-zinc-900",
                    itemCount === 0 && "hidden",
                  )}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              </Link>
            </Button>
            <Button asChild size="sm" className={tryOnBtnClass}>
              <Link href="/try-on" className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5 opacity-90" />
                Probar IA
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "border-t border-zinc-100/80 bg-white/95 backdrop-blur-xl lg:hidden dark:border-zinc-800/80 dark:bg-zinc-950/95",
          !menuOpen && "hidden",
        )}
      >
        <div className="jp-container space-y-0.5 py-4">
          {NAV_LINKS.map((l) => {
            const active = isNavActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                onClick={closeMenu}
                className={cn(
                  "block rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900/50",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href={tieneSesion ? "/account" : "/login"}
            onClick={closeMenu}
            className="block rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900/50"
          >
            {tieneSesion ? "Mi cuenta" : "Iniciar sesión"}
          </Link>
          <Button asChild className={cn(tryOnBtnClass, "mt-3 flex w-full sm:hidden")}>
            <Link
              href="/try-on"
              className="inline-flex items-center justify-center gap-1.5"
              onClick={closeMenu}
            >
              <Sparkles className="size-3.5 opacity-90" />
              Probar IA
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
