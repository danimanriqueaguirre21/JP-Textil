/**
 * Imágenes exclusivas del hero (assets en /public/images/hero).
 * 1 → dos modelos oversize · 2 → hoodie negro · 3 → look studio beige.
 */
export const HERO_COLLAGE_IMAGES = {
  left: {
    src: "/images/hero/capsule-1.png",
    alt: "Streetwear oversize — dos modelos en estudio",
    objectPosition: "center 18%",
  },
  center: {
    src: "/images/hero/capsule-2-hoodie.png",
    alt: "Hoodie negro oversize — OUT OF YOUR LIMITS",
    objectPosition: "center 32%",
  },
  right: {
    src: "/images/hero/capsule-3.png",
    alt: "Colección streetwear — edición limitada",
    objectPosition: "68% 15%",
  },
} as const;
