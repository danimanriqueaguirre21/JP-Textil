"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Hand,
  Maximize2,
  RotateCcw,
  ShoppingBag,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ViewerParticles } from "@/components/try-on/try-on-ui";
import { SizeComparator } from "@/components/virtual-fitting/size-comparator";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { getFittableProducts } from "@/lib/virtual-fitting/fittable-products";
import { SIZES, type Size } from "@/lib/sizing/recommender";
import { useAvatarCalibration } from "@/hooks/use-avatar-calibration";
import { normalizeAvatarMeasurements } from "@/lib/body-scan/normalize-avatar-measurements";
import { logMeasurementPipelineDebug } from "@/lib/body-scan/resolve-display-measurements";
import { loadFittingScene, preloadFittingScene } from "@/lib/virtual-fitting/load-fitting-scene";
import { mannequinScaleForHeight } from "@/lib/virtual-fitting/size-3d";
import type { AvatarGender } from "@/types/virtual-fitting";
import { cn } from "@/lib/utils";

const FittingScene = dynamic(
  () => loadFittingScene().then((Component) => ({ default: Component })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[480px] w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-violet-100/80 via-zinc-100 to-sky-100/70 text-sm text-zinc-600">
        <p>Cargando avatar 3D…</p>
        <p className="text-xs text-zinc-500">
          Primera carga ~36 MB; puede tardar 1–3 min. No cierres la pestaña.
        </p>
      </div>
    ),
  },
);

type Props = {
  referenceHeightCm?: number;
  estimatedChestCm?: number;
};

export function VirtualFitting3DPanel({
  referenceHeightCm: referenceHeightProp = 170,
  estimatedChestCm: estimatedChestProp = 99,
}: Props) {
  const { calibration, hydrated } = useAvatarCalibration();
  const products = useMemo(() => getFittableProducts(), []);
  const [activeSlug, setActiveSlug] = useState(products[0]?.slug ?? "");
  const [selectedSize, setSelectedSize] = useState<Size>("M");
  const [avatarGender, setAvatarGender] = useState<AvatarGender>("male");

  const normalized = useMemo(
    () =>
      calibration
        ? normalizeAvatarMeasurements({
            heightCm: calibration.heightCm,
            chestCm: calibration.chestCm,
            waistCm: calibration.waistCm,
            hipWidthCm: calibration.hipWidthCm,
            shoulderWidthCm: calibration.shoulderWidthCm,
            depthCm: calibration.depthCm,
            armLengthCm: calibration.armLengthCm,
            legLengthCm: calibration.legLengthCm,
          })
        : null,
    [calibration],
  );

  const referenceHeightCm = normalized?.heightCm ?? referenceHeightProp;
  const estimatedChestCm = normalized?.chestCm ?? estimatedChestProp;
  const zoneScales = calibration?.zoneScales;
  const heightScale =
    normalized?.heightScale ?? mannequinScaleForHeight(referenceHeightCm);
  const widthScale = normalized?.widthScale ?? calibration?.widthScale ?? 1;
  const depthScale = normalized?.depthScale ?? calibration?.depthScale ?? 1;

  useEffect(() => {
    preloadFittingScene();
  }, []);

  useEffect(() => {
    if (hydrated && calibration?.gender) {
      setAvatarGender(calibration.gender);
    }
  }, [hydrated, calibration?.gender]);

  useEffect(() => {
    if (!calibration || !normalized) return;
    logMeasurementPipelineDebug({
      fused: null,
      raw: calibration,
      human: normalized,
      technical: null,
    });
  }, [calibration, normalized]);

  const showHeightDebug =
    process.env.NEXT_PUBLIC_AVATAR_CALIBRATION_DEBUG === "true";

  const product = products.find((p) => p.slug === activeSlug) ?? products[0];

  if (!product) {
    return (
      <p className="text-sm text-zinc-500">No hay productos disponibles para vista 3D.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-zinc-200/70 bg-white/50 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.18)] backdrop-blur-sm dark:border-zinc-800/70 dark:bg-zinc-950/40">
      <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative min-h-[min(72vh,560px)] lg:min-h-[600px]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_55%,rgba(196,181,253,0.25)_0%,rgba(147,197,253,0.12)_45%,transparent_72%)]"
            aria-hidden
          />
          {calibration && normalized && (
            <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-2xl border border-emerald-200/70 bg-emerald-50/90 px-3 py-2 text-[10px] font-medium text-emerald-900 shadow-lg backdrop-blur dark:border-emerald-900/50 dark:bg-emerald-950/80 dark:text-emerald-100">
              Avatar calibrado · {normalized.heightCm} cm · pecho{" "}
              {normalized.chestCm} · cintura {normalized.waistCm} · brazo{" "}
              {normalized.armCm} · pierna {normalized.legCm}
            </div>
          )}
          <FittingScene
            size={selectedSize}
            gender={avatarGender}
            heightCm={referenceHeightCm}
            heightScale={heightScale}
            zoneScales={zoneScales}
            avatarCalibration={calibration ?? undefined}
            showHeightDebug={showHeightDebug}
            className="absolute inset-0 h-full w-full"
          />
          <ViewerParticles />

          <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/50 bg-white/75 px-4 py-3 shadow-lg backdrop-blur-md dark:border-zinc-700/50 dark:bg-zinc-950/70">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600/90 dark:text-violet-400">
              <Hand className="size-3" />
              Vista frontal
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Arrastra o desliza para girar
            </p>
          </div>

          <div className="absolute right-4 top-4 z-10">
            <GenderToggle gender={avatarGender} onChange={setAvatarGender} />
          </div>

          <div
            className="pointer-events-none absolute left-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2"
            aria-hidden
          >
            {(
              [
                { id: "rotate", Icon: RotateCcw },
                { id: "zoom-in", Icon: ZoomIn },
                { id: "zoom-out", Icon: ZoomOut },
                { id: "maximize", Icon: Maximize2 },
              ] as const
            ).map(({ id, Icon }) => (
              <span
                key={id}
                className="flex size-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-zinc-700 shadow-md backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300"
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col justify-center border-t border-zinc-100/80 bg-white/70 p-6 backdrop-blur-xl sm:p-8 lg:border-t-0 lg:border-l dark:border-zinc-800/80 dark:bg-zinc-950/50"
        >
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                {product.category}
              </p>
              <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-[1.65rem]">
                {product.name}
              </h3>
              <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatMoney(product.priceCents, product.currency)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {products.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  title={p.name}
                  onClick={() => setActiveSlug(p.slug)}
                  className={cn(
                    "relative size-[3.75rem] overflow-hidden rounded-2xl border-2 transition-all duration-300",
                    activeSlug === p.slug
                      ? "scale-105 border-violet-400 shadow-[0_0_24px_-4px_rgba(168,85,247,0.45)] ring-2 ring-violet-300/30"
                      : "border-zinc-200/80 opacity-85 hover:scale-105 hover:opacity-100 dark:border-zinc-700",
                  )}
                >
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="60px"
                    className="object-cover transition duration-500 hover:scale-110"
                  />
                </button>
              ))}
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Talla
              </p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <motion.button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      "min-w-[3rem] rounded-2xl border-2 px-4 py-2.5 text-sm font-bold transition-all duration-300",
                      selectedSize === s
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-[0_6px_24px_-6px_rgba(0,0,0,0.3),0_0_20px_-4px_rgba(168,85,247,0.2)] dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                        : "border-zinc-200/90 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900",
                    )}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>

            <SizeComparator
              chestCm={estimatedChestCm}
              selected={selectedSize}
              onSelect={setSelectedSize}
            />

            <Button
              asChild
              className="h-12 w-full rounded-full bg-zinc-900 text-xs font-bold uppercase tracking-[0.14em] shadow-lg transition hover:scale-[1.02] hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
            >
              <Link
                href={`/product/${product.slug}?size=${selectedSize}`}
                className="inline-flex items-center justify-center gap-2"
              >
                <ShoppingBag className="size-4" />
                Añadir al carrito — {selectedSize}
              </Link>
            </Button>
          </div>
        </motion.div>
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
        "pointer-events-auto relative grid w-[8.5rem] grid-cols-2 rounded-full border border-white/60 bg-white/80 p-1 shadow-md backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/80",
        className,
      )}
      role="group"
      aria-label="Tipo de avatar"
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-zinc-900 transition-[left] duration-300 ease-out dark:bg-zinc-50",
          gender === "male" ? "left-1" : "left-[calc(50%+0.125rem)]",
        )}
      />
      {(["male", "female"] as const).map((g) => (
        <button
          key={g}
          type="button"
          aria-pressed={gender === g}
          onClick={() => onChange(g)}
          className={cn(
            "relative z-10 rounded-full px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
            gender === g
              ? "text-white dark:text-zinc-900"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400",
          )}
        >
          {g === "male" ? "Hombre" : "Mujer"}
        </button>
      ))}
    </div>
  );
}
