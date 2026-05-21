"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { SizeComparator } from "@/components/virtual-fitting/size-comparator";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { getFittableProducts } from "@/lib/virtual-fitting/fittable-products";
import { SIZES, type Size } from "@/lib/sizing/recommender";
import type { AvatarGender } from "@/types/virtual-fitting";
import { cn } from "@/lib/utils";

const FittingScene = dynamic(
  () =>
    import("@/components/virtual-fitting/3d/fitting-scene").then((m) => m.FittingScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] w-full items-center justify-center bg-zinc-200 text-sm text-zinc-600">
        Cargando avatar 3D…
      </div>
    ),
  },
);

type Props = {
  referenceHeightCm?: number;
  estimatedChestCm?: number;
};

export function VirtualFitting3DPanel({
  referenceHeightCm = 170,
  estimatedChestCm = 99,
}: Props) {
  const products = useMemo(() => getFittableProducts(), []);
  const [activeSlug, setActiveSlug] = useState(products[0]?.slug ?? "");
  const [selectedSize, setSelectedSize] = useState<Size>("M");
  const [avatarGender, setAvatarGender] = useState<AvatarGender>("female");

  const product = products.find((p) => p.slug === activeSlug) ?? products[0];

  if (!product) {
    return (
      <p className="text-sm text-zinc-500">No hay productos disponibles para vista 3D.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Vista 3D primero — lo que el usuario debe ver al instante */}
      <div className="relative h-[min(72vh,560px)] min-h-[480px] w-full bg-zinc-200">
        <FittingScene
          size={selectedSize}
          gender={avatarGender}
          heightCm={referenceHeightCm}
        />
        <div className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur dark:bg-black/70">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Avatar {avatarGender === "female" ? "mujer" : "hombre"}
          </p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Vista frontal · arrastra o desliza para girar
          </p>
        </div>
        <div className="absolute right-4 top-4 hidden sm:block">
          <GenderToggle gender={avatarGender} onChange={setAvatarGender} />
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              {product.category}
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {product.name}
            </h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Modelos 3D humanos (malla real). Elige hombre o mujer; la prenda se adapta al
            cuerpo y a la talla seleccionada.
          </p>
          <GenderToggle
            gender={avatarGender}
            onChange={setAvatarGender}
            className="lg:hidden"
          />
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <button
                key={p.slug}
                type="button"
                title={p.name}
                onClick={() => setActiveSlug(p.slug)}
                className={cn(
                  "relative h-14 w-14 overflow-hidden rounded-xl border-2 transition-all",
                  activeSlug === p.slug
                    ? "border-zinc-900 ring-2 ring-zinc-900/20 dark:border-zinc-50"
                    : "border-zinc-200 opacity-80 hover:opacity-100 dark:border-zinc-700",
                )}
              >
                <Image src={p.images[0]} alt={p.name} fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatMoney(product.priceCents, product.currency)}
          </p>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Talla — la prenda en 3D se ajusta al instante
            </p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={cn(
                    "min-w-[2.75rem] rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all",
                    selectedSize === s
                      ? "scale-105 border-zinc-900 bg-zinc-900 text-white shadow-md dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                      : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <SizeComparator
            chestCm={estimatedChestCm}
            selected={selectedSize}
            onSelect={setSelectedSize}
          />
          <Button asChild className="h-12 w-full rounded-none text-sm font-semibold uppercase tracking-wider">
            <Link href={`/product/${product.slug}?size=${selectedSize}`}>
              Añadir al carrito — {selectedSize}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function GenderToggle({
  gender,
  onChange,
  className,
}: {
  gender: AvatarGender;
  onChange: (g: AvatarGender) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex rounded-full border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-900",
        className,
      )}
      role="group"
      aria-label="Tipo de avatar"
    >
      <button
        type="button"
        onClick={() => onChange("female")}
        className={cn(
          "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all",
          gender === "female"
            ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400",
        )}
      >
        Mujer
      </button>
      <button
        type="button"
        onClick={() => onChange("male")}
        className={cn(
          "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all",
          gender === "male"
            ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400",
        )}
      >
        Hombre
      </button>
    </div>
  );
}
