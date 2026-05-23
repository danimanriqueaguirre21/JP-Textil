"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import type { CategoryCarouselItem } from "./category-carousel-data";

type Props = {
  items: CategoryCarouselItem[];
};

const CARD_SIZES = cn(
  "h-[26rem] w-[min(88vw,19.5rem)] shrink-0 snap-start sm:h-[27.5rem]",
  "sm:w-[calc((100%-1.25rem)/2)]",
  "lg:h-[30rem] lg:w-[calc((100%-3.75rem)/4)]",
);

const navBtnClass =
  "inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-100 bg-white text-zinc-900 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.16)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

const glassBadge =
  "rounded-full border border-white/50 bg-white/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-[0_4px_24px_-6px_rgba(0,0,0,0.2)] backdrop-blur-md";

export function CategoryCarousel({ items }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const syncScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);

    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-slide]"));
    if (!cards.length) return;

    const center = el.scrollLeft + el.clientWidth / 2;
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < cards.length; i++) {
      const cardCenter = cards[i].offsetLeft + cards[i].offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    }
    setActive(nearest);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncScrollState();
    el.addEventListener("scroll", syncScrollState, { passive: true });
    window.addEventListener("resize", syncScrollState);
    return () => {
      el.removeEventListener("scroll", syncScrollState);
      window.removeEventListener("resize", syncScrollState);
    };
  }, [syncScrollState, items.length]);

  const getScrollStep = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    const card = el.querySelector<HTMLElement>("[data-slide]");
    if (!card) return el.clientWidth * 0.8;
    const style = getComputedStyle(el);
    const gap = parseFloat(style.gap || style.columnGap || "20") || 20;
    return card.offsetWidth + gap;
  }, []);

  const scrollByDir = useCallback(
    (dir: -1 | 1) => {
      const el = trackRef.current;
      if (!el) return;
      el.scrollBy({ left: dir * getScrollStep(), behavior: "smooth" });
    },
    [getScrollStep],
  );

  const scrollToIndex = useCallback((index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(`[data-slide="${index}"]`);
    if (!card) return;
    const target =
      card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({
      left: Math.max(0, target),
      behavior: "smooth",
    });
  }, []);

  return (
    <section
      aria-labelledby="category-carousel-title"
      className="relative overflow-hidden bg-white py-14 dark:bg-zinc-950 sm:py-16 lg:py-20"
    >
      {/* Glow ambiental */}
      <div
        className="pointer-events-none absolute left-1/2 top-[48%] h-[22rem] w-[min(100%,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[180px] sm:h-[26rem] sm:w-[52rem]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(236,72,153,0.1) 0%, rgba(168,85,247,0.08) 42%, transparent 72%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[18%] top-[55%] h-48 w-48 rounded-full blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[12%] top-[42%] h-56 w-56 rounded-full blur-[180px]"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.09) 0%, transparent 72%)",
        }}
        aria-hidden
      />

      <div className="jp-container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-violet-600/80 dark:text-violet-400/90">
            Colecciones JotaPe
          </p>
          <h2
            id="category-carousel-title"
            className="mt-3 max-w-lg text-balance text-2xl font-bold uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-50 sm:text-3xl"
          >
            Explora por estilo
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Desliza o usa las flechas sobre las tarjetas.
          </p>
        </motion.div>

        <div className="relative mt-10 sm:mt-12">
          <div
            ref={trackRef}
            className={cn(
              "relative flex w-full snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible scroll-smooth py-3",
              "[scrollbar-width:none] [-ms-overflow-style:none]",
              "[&::-webkit-scrollbar]:hidden",
            )}
          >
            {items.map((item, index) => {
              const isActive = index === active;
              return (
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-24px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  data-slide={index}
                  className={cn(CARD_SIZES, "snap-center sm:snap-start")}
                >
                  <Link
                    href={`/category/${item.slug}`}
                    className={cn(
                      "group relative block h-full w-full overflow-hidden rounded-[2rem] transition-all duration-500",
                      "shadow-[0_20px_50px_-24px_rgba(15,23,42,0.2)]",
                      "hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-20px_rgba(15,23,42,0.28)]",
                      isActive
                        ? "scale-[1.02] ring-2 ring-fuchsia-300/35 shadow-[0_24px_56px_-18px_rgba(168,85,247,0.22),0_0_48px_-12px_rgba(236,72,153,0.15)]"
                        : "scale-[0.98] opacity-[0.92] hover:opacity-100",
                    )}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.06]"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 88vw"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />

                    {isActive && (
                      <div
                        className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/20"
                        aria-hidden
                      />
                    )}

                    <span
                      className={cn(
                        "absolute left-4 top-4 font-mono text-[11px] font-medium tracking-[0.2em] text-white/90",
                        glassBadge,
                        "border-white/30 bg-black/15 px-2.5 py-0.5",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={cn("absolute right-4 top-4", glassBadge)}>
                      {item.count}{" "}
                      {item.count === 1 ? "producto" : "productos"}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 pr-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
                          {item.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/75 sm:text-sm">
                          {item.hint}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                          "border border-white/70 bg-white/10 text-white backdrop-blur-sm",
                          "transition duration-300 group-hover:border-white group-hover:bg-white/20",
                        )}
                        aria-hidden
                      >
                        <ArrowRight className="size-4" strokeWidth={2.25} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Categoría anterior"
            disabled={!canPrev}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollByDir(-1);
            }}
            className={cn(
              navBtnClass,
              "absolute -left-1 top-1/2 z-20 -translate-y-1/2 sm:left-0 lg:-left-2",
            )}
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Siguiente categoría"
            disabled={!canNext}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollByDir(1);
            }}
            className={cn(
              navBtnClass,
              "absolute -right-1 top-1/2 z-20 -translate-y-1/2 sm:right-0 lg:-right-2",
            )}
          >
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-2.5">
          {items.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              aria-label={`Ir a ${item.title}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => scrollToIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === active
                  ? "w-9 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-sky-400 shadow-[0_0_12px_-2px_rgba(168,85,247,0.45)]"
                  : "w-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
