import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { unsplashPhoto } from "@/lib/image-urls";

export function Hero() {
  return (
    <section data-testid="home-hero" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-zinc-50 dark:from-black dark:via-black dark:to-zinc-950" />
        <div className="absolute -top-24 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-zinc-900/5 blur-3xl dark:bg-white/5" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 md:py-20">
        <div className="space-y-6">
          <Badge className="jp-animate-fade-up border-zinc-200 bg-white px-4 py-1.5 text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
            Poleras y buzos baggy · Huancayo
          </Badge>
          <h1 className="jp-animate-fade-up jp-delay-1 text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Confección textil de Huancayo. Streetwear que calza perfecto.
          </h1>
          <p className="jp-animate-fade-up jp-delay-2 max-w-xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Diseñamos poleras y buzos baggy con caída precisa y algodón de
            calidad. Cada prenda está pensada para nuestra IA de tallas —
            menos devoluciones, mejor calce.
          </p>

          <div className="jp-animate-fade-up jp-delay-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild className="rounded-full">
              <Link href="/catalog">
                Ver catálogo <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/category/buzo-baggy">Buzos baggy</Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6">
            {[
              { k: "Desde", v: "S/ 35" },
              { k: "Envíos", v: "A todo el Perú" },
              { k: "Tallas", v: "XS – XL" },
            ].map((x) => (
              <div key={x.k} className="space-y-1">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {x.k}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  {x.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative jp-animate-fade-in">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
            <Image
              src={unsplashPhoto("photo-1521572163474-6864f9cf17ab")}
              alt="Polera oversize JotaPe Textil"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>

          <Link
            href="/try-on"
            className="absolute -bottom-5 -left-5 hidden rounded-3xl border border-zinc-200 bg-white px-5 py-4 shadow-sm transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-black dark:hover:border-zinc-600 md:block jp-hover-lift"
          >
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Pruébalo ahora · Beta
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              IA de tallas · Probador virtual
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
