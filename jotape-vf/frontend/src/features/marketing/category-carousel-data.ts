import { CATEGORY_LABELS } from "@/lib/data/products";
import { unsplashPhoto } from "@/lib/image-urls";
import { catalogService } from "@/services/catalog.service";
import type { CatalogCategorySlug } from "@/services/catalog.service";

export type CategoryCarouselItem = {
  slug: CatalogCategorySlug;
  title: string;
  count: number;
  image: string;
  hint: string;
};

const CAROUSEL_SLUGS: {
  slug: CatalogCategorySlug;
  image: string;
  hint: string;
}[] = [
  {
    slug: "oversize",
    image: unsplashPhoto("photo-1521572163474-6864f9cf17ab", 1200),
    hint: "Hombros caídos · algodón pesado",
  },
  {
    slug: "buzo-baggy",
    image: unsplashPhoto("photo-1517438476312-10d79c077509", 1200),
    hint: "French terry · calce relajado",
  },
  {
    slug: "hoodie",
    image: unsplashPhoto("photo-1556821840-3a63f95609a7", 1200),
    hint: "Capucha y bolsillo canguro",
  },
  {
    slug: "basica",
    image: unsplashPhoto("photo-1620799140408-edc6dcb6d633", 1200),
    hint: "Essentials · desde S/ 35",
  },
  {
    slug: "estampada",
    image: unsplashPhoto("photo-1576566588028-4147f3842f27", 1200),
    hint: "Gráficos y tipografía",
  },
  {
    slug: "crop",
    image: unsplashPhoto("photo-1503342394128-c104d54dba01", 1200),
    hint: "Corte cropped · verano",
  },
];

export function getCategoryCarouselItems(): CategoryCarouselItem[] {
  return CAROUSEL_SLUGS.map(({ slug, image, hint }) => ({
    slug,
    image,
    hint,
    title: CATEGORY_LABELS[slug] ?? slug,
    count: catalogService.listByCategory(slug).length,
  }));
}
