"use client";

import { motion, type Variants } from "framer-motion";
import { Check, Star } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { HERO_COLLAGE_IMAGES } from "./hero-collage-images";

const PILL_SIDE = {
  width: "w-[11.25rem] sm:w-[12rem] lg:w-[12.75rem]",
  height: "h-[22rem] sm:h-[24rem] lg:h-[26rem]",
} as const;

const PILL_CENTER = {
  width: "w-[13.5rem] sm:w-[15rem] lg:w-[16.5rem]",
  height: "h-[27rem] sm:h-[30rem] lg:h-[33rem]",
} as const;

const PILL_SKIN_BASE =
  "overflow-hidden rounded-[9999px] bg-zinc-100 ring-[2.5px] ring-white/95 dark:ring-white/20";

const PILL_SKIN_SIDE = cn(
  "shadow-[0_40px_90px_-48px_rgba(15,23,42,0.14),0_28px_70px_-40px_rgba(168,85,247,0.07),0_12px_40px_-28px_rgba(236,72,153,0.05)]",
  "dark:shadow-[0_40px_90px_-48px_rgba(0,0,0,0.35),0_28px_70px_-40px_rgba(168,85,247,0.1)]",
);

const PILL_SKIN_CENTER = cn(
  "shadow-[0_52px_110px_-52px_rgba(15,23,42,0.1),0_36px_90px_-44px_rgba(168,85,247,0.1),0_20px_60px_-36px_rgba(236,72,153,0.08),0_0_100px_-40px_rgba(196,181,253,0.12)]",
  "dark:shadow-[0_52px_110px_-52px_rgba(0,0,0,0.28),0_36px_90px_-44px_rgba(168,85,247,0.14),0_0_100px_-40px_rgba(236,72,153,0.1)]",
);

/** Partículas de luz — muy sutiles, alrededor del collage. */
const LIGHT_SPECKS = [
  { left: "8%", top: "22%", size: 2, delay: 0, tone: "violet" },
  { left: "22%", top: "58%", size: 3, delay: 0.6, tone: "pink" },
  { left: "38%", top: "18%", size: 2, delay: 1.2, tone: "white" },
  { left: "52%", top: "72%", size: 2, delay: 0.3, tone: "violet" },
  { left: "68%", top: "26%", size: 3, delay: 1.8, tone: "pink" },
  { left: "78%", top: "52%", size: 2, delay: 0.9, tone: "blue" },
  { left: "88%", top: "38%", size: 2, delay: 2.1, tone: "white" },
  { left: "14%", top: "78%", size: 2, delay: 1.4, tone: "blue" },
] as const;

const SPECK_TONE: Record<(typeof LIGHT_SPECKS)[number]["tone"], string> = {
  violet: "bg-violet-300/35 shadow-[0_0_12px_2px_rgba(168,85,247,0.15)]",
  pink: "bg-fuchsia-200/40 shadow-[0_0_10px_2px_rgba(236,72,153,0.12)]",
  blue: "bg-sky-200/35 shadow-[0_0_10px_2px_rgba(96,165,250,0.12)]",
  white: "bg-white/70 shadow-[0_0_8px_1px_rgba(255,255,255,0.4)]",
};

const COLLAGE_WIDTH =
  "w-[30rem] sm:w-[33rem] lg:w-[36rem]";

const FLOAT_TRANSITION = {
  duration: 5.5,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

const collageContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const capsuleLeftVariants: Variants = {
  hidden: { opacity: 0, x: -72, scale: 0.88 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 110, damping: 16 },
  },
};

const capsuleCenterVariants: Variants = {
  hidden: { opacity: 0, y: 64, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 110, damping: 16 },
  },
};

const capsuleRightVariants: Variants = {
  hidden: { opacity: 0, x: 72, scale: 0.88 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 110, damping: 16 },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 12,
      delay: 0.85,
    },
  },
};

type PillSize = "side" | "center";

type PillProps = {
  src: string;
  alt: string;
  objectPosition: string;
  positionClassName: string;
  variants: Variants;
  size: PillSize;
  floatDelay?: number;
  priority?: boolean;
  sizes: string;
};

function HeroPill({
  src,
  alt,
  objectPosition,
  positionClassName,
  variants,
  size,
  floatDelay = 0,
  priority,
  sizes,
}: PillProps) {
  const dimensions =
    size === "center"
      ? cn(PILL_CENTER.width, PILL_CENTER.height)
      : cn(PILL_SIDE.width, PILL_SIDE.height);

  return (
    <motion.div
      variants={variants}
      className={cn("absolute", dimensions, positionClassName)}
    >
      <motion.div
        className="h-full w-full"
        animate={{ y: [0, size === "center" ? -10 : -7, 0] }}
        transition={{
          ...FLOAT_TRANSITION,
          delay: floatDelay,
        }}
      >
        <div
          className={cn(
            "relative h-full w-full",
            PILL_SKIN_BASE,
            size === "center" ? PILL_SKIN_CENTER : PILL_SKIN_SIDE,
          )}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover"
            style={{ objectPosition }}
            sizes={sizes}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

type BadgeProps = {
  children: ReactNode;
  positionClassName: string;
  icon?: ReactNode;
};

/** Capas de luz ambiental detrás de las cápsulas (z-0). */
function HeroCollageAtmosphere() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      aria-hidden
    >
      {/* Wash base — difusión en el fondo blanco */}
      <div
        className="absolute left-1/2 top-[44%] h-[130%] w-[140%] -translate-x-1/2 -translate-y-1/2 blur-[180px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(236,72,153,0.12) 0%, rgba(168,85,247,0.08) 42%, rgba(96,165,250,0.04) 62%, transparent 78%)",
        }}
      />

      {/* Foco principal — cápsula central (capa más intensa) */}
      <div
        className="absolute left-1/2 top-[34%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[220px] sm:h-80 sm:w-80 lg:h-[22rem] lg:w-[22rem]"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(236,72,153,0.18) 38%, rgba(244,114,182,0.08) 58%, transparent 78%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[34%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[180px] sm:h-60 sm:w-60 lg:h-72 lg:w-72"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.16) 0%, rgba(168,85,247,0.12) 50%, transparent 72%)",
        }}
      />
      {/* Halo de extensión — luz que se expande al fondo */}
      <div
        className="absolute left-1/2 top-[36%] h-[min(100%,32rem)] w-[min(120%,38rem)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[220px] sm:h-[34rem] sm:w-[40rem]"
        style={{
          background:
            "radial-gradient(ellipse 72% 68% at 50% 45%, rgba(196,181,253,0.12) 0%, rgba(236,72,153,0.07) 48%, transparent 74%)",
        }}
      />

      {/* Luz azul cinematográfica — inferior izquierda */}
      <div
        className="absolute bottom-[10%] left-[4%] h-40 w-40 rounded-full blur-[180px] sm:bottom-[12%] sm:left-[6%] sm:h-52 sm:w-52 lg:h-60 lg:w-60"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.12) 0%, rgba(147,197,253,0.06) 55%, transparent 80%)",
        }}
      />

      {/* Acento rosa lateral — equilibrio suave */}
      <div
        className="absolute left-[0%] top-[30%] h-44 w-44 rounded-full blur-[180px] sm:left-[2%] sm:h-56 sm:w-56"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 72%)",
        }}
      />

      {/* Suelo luminoso — profundidad inferior */}
      <div
        className="absolute bottom-[2%] left-1/2 h-32 w-[92%] -translate-x-1/2 rounded-[100%] blur-[220px] sm:h-36"
        style={{
          background:
            "radial-gradient(ellipse 85% 100% at 50% 100%, rgba(168,85,247,0.1) 0%, rgba(236,72,153,0.06) 45%, transparent 72%)",
        }}
      />

      {/* Anillos Vision Pro — apenas visibles */}
      <div className="absolute left-1/2 top-[38%] h-[17rem] w-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/[0.12] opacity-[0.35] sm:h-[19rem] sm:w-[19rem] lg:h-[21rem] lg:w-[21rem]" />
      <div className="absolute left-1/2 top-[38%] h-[21rem] w-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-100/[0.1] opacity-[0.28] sm:h-[23rem] sm:w-[23rem] lg:h-[25rem] lg:w-[25rem]" />
      <div className="absolute left-1/2 top-[38%] h-[25rem] w-[25rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-100/[0.08] opacity-[0.22] sm:h-[27rem] sm:w-[27rem] lg:h-[29rem] lg:w-[29rem]" />
      <div className="absolute left-1/2 top-[38%] h-[29rem] w-[29rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-100/[0.07] opacity-[0.18] sm:h-[31rem] sm:w-[31rem] lg:h-[33rem] lg:w-[33rem]" />
      <div className="absolute left-1/2 top-[38%] h-[33rem] w-[33rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-200/[0.06] opacity-[0.14] sm:h-[35rem] sm:w-[35rem] lg:h-[37rem] lg:w-[37rem]" />

      {/* Topografía — textura mínima */}
      <div
        className="absolute inset-[-10%] opacity-[0.14] mix-blend-multiply dark:opacity-[0.08] dark:mix-blend-screen"
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 58% 38%, transparent 0, transparent 64px, rgba(168,85,247,0.025) 64px, rgba(168,85,247,0.025) 65px)",
        }}
      />

      {/* Sombra ambiental difusa bajo el grupo */}
      <div className="absolute bottom-[6%] left-1/2 h-20 w-[78%] -translate-x-1/2 rounded-[100%] bg-zinc-900/[0.025] blur-[80px] sm:h-24 sm:w-[74%]" />
    </div>
  );
}

function HeroCollageParticles() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[8] overflow-visible"
      aria-hidden
    >
      {LIGHT_SPECKS.map((speck, index) => (
        <motion.span
          key={`${speck.left}-${speck.top}`}
          className={cn(
            "absolute rounded-full",
            SPECK_TONE[speck.tone],
          )}
          style={{
            left: speck.left,
            top: speck.top,
            width: speck.size,
            height: speck.size,
          }}
          animate={{
            opacity: [0.15, 0.45, 0.15],
            y: [0, -6, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 4.5 + index * 0.35,
            repeat: Infinity,
            ease: "easeInOut",
            delay: speck.delay,
          }}
        />
      ))}
    </div>
  );
}

function HeroBadge({ children, positionClassName, icon }: BadgeProps) {
  return (
    <div className={cn("absolute z-50", positionClassName)}>
      <motion.div
        variants={badgeVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-1.5 whitespace-nowrap rounded-2xl border border-white/80 bg-white/95 px-3.5 py-2.5 text-[10px] font-bold leading-none text-zinc-900 shadow-[0_10px_32px_-10px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:text-[11px]"
      >
        {icon}
        {children}
      </motion.div>
    </div>
  );
}

export function HeroVisualCollage() {
  return (
    <div className="relative flex w-full items-center justify-center overflow-visible lg:justify-end">
      {/* Halo exterior — fundido cinematográfico con el hero */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(100%,40rem)] w-[min(110%,44rem)] -translate-x-1/2 -translate-y-[42%] blur-[220px] lg:-translate-y-[38%]"
        style={{
          background:
            "radial-gradient(ellipse 68% 58% at 50% 48%, rgba(236,72,153,0.09) 0%, rgba(168,85,247,0.07) 42%, transparent 76%)",
        }}
        aria-hidden
      />

      <motion.div
        variants={collageContainerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "relative overflow-visible -translate-y-[0.5cm]",
          COLLAGE_WIDTH,
          "h-[30rem] sm:h-[33rem] lg:h-[36rem]",
        )}
      >
        <HeroCollageAtmosphere />
        <HeroCollageParticles />

        <HeroPill
          src={HERO_COLLAGE_IMAGES.left.src}
          alt={HERO_COLLAGE_IMAGES.left.alt}
          objectPosition={HERO_COLLAGE_IMAGES.left.objectPosition}
          variants={capsuleLeftVariants}
          size="side"
          floatDelay={0.4}
          positionClassName="left-0 top-12 z-10 sm:top-14 lg:top-16"
          sizes="(min-width: 1024px) 210px, 192px"
        />

        <HeroPill
          src={HERO_COLLAGE_IMAGES.right.src}
          alt={HERO_COLLAGE_IMAGES.right.alt}
          objectPosition={HERO_COLLAGE_IMAGES.right.objectPosition}
          variants={capsuleRightVariants}
          size="side"
          floatDelay={0.9}
          positionClassName="left-[17.25rem] top-16 z-10 sm:left-[19.5rem] sm:top-[4.5rem] lg:left-[22.25rem] lg:top-20"
          sizes="(min-width: 1024px) 210px, 192px"
        />

        <HeroPill
          src={HERO_COLLAGE_IMAGES.center.src}
          alt={HERO_COLLAGE_IMAGES.center.alt}
          objectPosition={HERO_COLLAGE_IMAGES.center.objectPosition}
          variants={capsuleCenterVariants}
          size="center"
          floatDelay={0}
          priority
          positionClassName="left-1/2 top-4 z-40 -translate-x-1/2 sm:top-5 lg:top-6"
          sizes="(min-width: 1024px) 270px, 240px"
        />

        <HeroBadge
          positionClassName="left-1/2 top-0 z-50 -translate-x-1/2"
          icon={<Check className="size-3 shrink-0 text-emerald-600" strokeWidth={3} />}
        >
          100% satisfacción garantizada
        </HeroBadge>

        <HeroBadge
          positionClassName={cn(
            "left-[18%] z-50 -translate-y-1/2 sm:left-[20%] lg:left-[18%]",
            "top-[calc(3rem+22rem)] sm:top-[calc(3.5rem+24rem)] lg:top-[calc(4rem+26rem)]",
          )}
          icon={<Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />}
        >
          Diseños edición limitada
        </HeroBadge>
      </motion.div>
    </div>
  );
}
