import Link from "next/link";

import { ProductGrid } from "@/components/commerce/product-grid";
import { Button } from "@/components/ui/button";
import { catalogService } from "@/services/catalog.service";

export function FeaturedSection() {
  const featured = catalogService.listFeatured();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 jp-animate-fade-up">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Poleras destacadas
          </h2>
          <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Las favoritas de la temporada — algodón premium, cortes minimalistas
            y listas para nuestro recomendador inteligente de tallas.
          </p>
        </div>
        <Button asChild variant="outline" className="sm:self-end">
          <Link href="/catalog">Ver catálogo completo</Link>
        </Button>
      </div>

      <div className="mt-8 jp-animate-fade-up jp-delay-1">
        <ProductGrid products={featured} />
      </div>
    </section>
  );
}
