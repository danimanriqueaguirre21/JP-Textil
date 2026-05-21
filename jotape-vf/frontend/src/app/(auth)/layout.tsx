import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white/90 px-4 py-5 backdrop-blur dark:border-zinc-800 dark:bg-black/90 sm:px-6">
        <Link
          href="/"
          className="text-xs font-semibold tracking-[0.22em] uppercase text-zinc-900 dark:text-zinc-50 sm:text-sm"
        >
          JotaPe Textil
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-sm jp-animate-fade-up">{children}</div>
      </div>
    </div>
  );
}
