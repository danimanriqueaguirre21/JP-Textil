"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="jp-animate-fade-up rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30 sm:p-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Newsletter
            </h2>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Novedades, lanzamientos y acceso anticipado a funciones de IA para
              tallas y probador virtual.
            </p>
          </div>

          <form
            className="flex w-full flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Input
              type="email"
              name="email"
              required
              placeholder="Correo electrónico"
              aria-label="Correo electrónico"
              className="sm:flex-1"
            />
            <Button type="submit">Suscribirme</Button>
          </form>
        </div>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
          Al suscribirte aceptas recibir correos. Puedes darte de baja cuando
          quieras.
        </p>
      </div>
    </section>
  );
}
