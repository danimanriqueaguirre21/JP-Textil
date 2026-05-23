import {
  getProductsByCategorySlug,
  PRODUCTS,
} from "@/lib/data/products";
import type { Product } from "@/types/commerce";

export type ShopAudience = "tendencias" | "hombre" | "mujer";

/** Categorías mostradas por audiencia (mock hasta campo género en API). */
const HOMBRE_CATEGORIES = new Set([
  "oversize",
  "buzo-baggy",
  "hoodie",
  "manga-larga",
  "basica",
  "estampada",
]);

const MUJER_CATEGORIES = new Set([
  "crop",
  "oversize",
  "basica",
  "estampada",
  "hoodie",
  "buzo-baggy",
]);

export function listProductsByAudience(audience: ShopAudience): Product[] {
  if (audience === "tendencias") {
    return getProductsByCategorySlug("new-in");
  }
  if (audience === "hombre") {
    return PRODUCTS.filter((p) => HOMBRE_CATEGORIES.has(p.categorySlug));
  }
  return PRODUCTS.filter((p) => MUJER_CATEGORIES.has(p.categorySlug));
}

export const AUDIENCE_PAGE_COPY: Record<
  ShopAudience,
  { title: string; description: string }
> = {
  tendencias: {
    title: "Tendencias",
    description:
      "Novedades y piezas destacadas de la temporada — poleras y buzos baggy JotaPe.",
  },
  hombre: {
    title: "Hombre",
    description:
      "Oversize, buzos baggy, hoodies y básicas pensadas para calce masculino.",
  },
  mujer: {
    title: "Mujer",
    description:
      "Crop, oversize y essentials con proporciones y tallas para mujer.",
  },
};
