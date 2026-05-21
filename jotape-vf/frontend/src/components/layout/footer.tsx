import Link from "next/link";

import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = [
  {
    title: "Ayuda",
    links: [
      { label: "Envíos", href: "/help/shipping" },
      { label: "Devoluciones", href: "/help/returns" },
      { label: "Contacto", href: "/help/contact" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre JotaPe", href: "/about" },
      { label: "Huancayo", href: "/about" },
      { label: "Sostenibilidad", href: "/sustainability" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", href: "/privacy" },
      { label: "Términos", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4 jp-animate-fade-up">
            <div className="text-xs font-semibold tracking-[0.22em] uppercase text-zinc-900 dark:text-zinc-50">
              JotaPe Textil
            </div>
            <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Poleras y buzos baggy hechos en Huancayo. Confección textil
              premium — e-commerce preparado para Machine Learning, visión por
              computador y probador virtual.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Público 18–35 · Oversize · Hoodies · Buzos Baggy · Básicas · Crop.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title} className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
                  {group.title}
                </div>
                <ul className="space-y-2">
                  {group.links.map((l) => (
                    <li key={`${group.title}-${l.label}`}>
                      <Link
                        href={l.href}
                        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <Separator className="mb-6" />
          <div className="flex flex-col gap-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <div>
              © {new Date().getFullYear()} JotaPe Textil · Huancayo, Perú
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                Privacidad
              </Link>
              <Link
                href="/terms"
                className="hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                Términos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
