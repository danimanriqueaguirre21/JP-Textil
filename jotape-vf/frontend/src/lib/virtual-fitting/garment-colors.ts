/** Color de prenda 3D por slug (visible sin depender de textura remota). */
export const GARMENT_COLOR_BY_SLUG: Record<string, string> = {
  "polera-oversize-negra": "#18181b",
  "polera-oversize-blanca": "#f4f4f5",
  "polera-hoodie-gris": "#71717a",
  "polera-basica-blanca": "#fafafa",
  "buzo-baggy-negro": "#27272a",
};

export function garmentColorForSlug(slug: string): string {
  return GARMENT_COLOR_BY_SLUG[slug] ?? "#3f3f46";
}
