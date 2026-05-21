import Link from "next/link";

import { AccountMobileNav, AccountSidebar } from "@/features/account";

export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-900 dark:text-zinc-50"
          >
            JotaPe Textil
          </Link>
          <Link
            href="/cart"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Bolsa
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <AccountMobileNav />
        <div className="flex gap-10 lg:gap-14">
          <aside className="hidden w-52 shrink-0 md:block lg:w-56">
            <AccountSidebar />
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
