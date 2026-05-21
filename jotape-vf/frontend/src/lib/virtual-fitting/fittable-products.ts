import { catalogService } from "@/services/catalog.service";
import type { Product } from "@/types/commerce";

export const FITTABLE_SLUGS = [
  "polera-oversize-negra",
  "polera-oversize-blanca",
  "polera-hoodie-gris",
  "polera-basica-blanca",
  "buzo-baggy-negro",
] as const;

export function getFittableProducts(): Product[] {
  return FITTABLE_SLUGS.map((slug) => catalogService.getBySlug(slug)).filter(
    (p): p is Product => Boolean(p),
  );
}
