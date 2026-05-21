import type { Product } from "@/types/commerce";

import { unsplashPhoto } from "@/lib/image-urls";

/**
 * JotaPe Textil — catálogo enfocado 100% en poleras y buzos baggy.
 * Precios en soles peruanos (PEN). Centavos como unidad mínima.
 */

const POLERA_SIZES = ["XS", "S", "M", "L", "XL"];
const BUZO_SIZES = ["S", "M", "L", "XL"];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "polera-oversize-negra",
    name: "Polera Oversize Negra",
    description:
      "Polera oversize en algodón pesado 240 g/m². Hombros caídos y caída fluida — la base de cualquier outfit minimalista.",
    category: "Oversize",
    categorySlug: "oversize",
    priceCents: 13500,
    currency: "PEN",
    images: [unsplashPhoto("photo-1521572163474-6864f9cf17ab")],
    sizes: POLERA_SIZES,
    featured: true,
  },
  {
    id: "2",
    slug: "polera-basica-blanca",
    name: "Polera Básica Blanca",
    description:
      "Algodón peinado 180 g/m². Cuello reforzado y costuras planas. La esencial blanca para todos los días.",
    category: "Básica",
    categorySlug: "basica",
    priceCents: 3500,
    currency: "PEN",
    images: [unsplashPhoto("photo-1620799140408-edc6dcb6d633")],
    sizes: POLERA_SIZES,
    featured: true,
  },
  {
    id: "3",
    slug: "polera-hoodie-gris",
    name: "Polera Hoodie Gris",
    description:
      "Polera con capucha en french terry. Bolsillo canguro, cordón ajustable y puños tejidos.",
    category: "Hoodie",
    categorySlug: "hoodie",
    priceCents: 8000,
    currency: "PEN",
    images: [unsplashPhoto("photo-1556821840-3a63f95609a7")],
    sizes: POLERA_SIZES,
    featured: true,
  },
  {
    id: "4",
    slug: "polera-manga-larga-negra",
    name: "Polera Manga Larga Negra",
    description:
      "Polera manga larga slim fit en jersey suave. Ideal para layering bajo chaquetas.",
    category: "Manga Larga",
    categorySlug: "manga-larga",
    priceCents: 5500,
    currency: "PEN",
    images: [unsplashPhoto("photo-1503342394128-c104d54dba01")],
    sizes: POLERA_SIZES,
    featured: true,
  },
  {
    id: "5",
    slug: "polera-crop-blanca",
    name: "Polera Crop Blanca",
    description:
      "Crop top en jersey 100% algodón. Largo corto y manga regular — versátil para mujer.",
    category: "Crop",
    categorySlug: "crop",
    priceCents: 4500,
    currency: "PEN",
    images: [unsplashPhoto("photo-1515886657613-9f3515b0c78f")],
    sizes: ["XS", "S", "M", "L"],
    featured: true,
  },
  {
    id: "6",
    slug: "polera-estampada-huancayo",
    name: "Polera Estampada Huancayo",
    description:
      "Polera con estampado serigrafiado edición Huancayo. Algodón medio, tacto premium.",
    category: "Estampada",
    categorySlug: "estampada",
    priceCents: 6500,
    currency: "PEN",
    images: [unsplashPhoto("photo-1503341504253-dff4815485f1")],
    sizes: POLERA_SIZES,
    featured: true,
  },
  {
    id: "7",
    slug: "polera-oversize-blanca",
    name: "Polera Oversize Blanca",
    description:
      "Versión blanca de nuestra polera oversize estrella. Algodón pesado y silueta relajada.",
    category: "Oversize",
    categorySlug: "oversize",
    priceCents: 13500,
    currency: "PEN",
    images: [unsplashPhoto("photo-1576566588028-4147f3842f27")],
    sizes: POLERA_SIZES,
    featured: false,
  },
  {
    id: "8",
    slug: "polera-hoodie-negra",
    name: "Polera Hoodie Negra",
    description:
      "Hoodie negra unisex en french terry. Cordón mate y bolsillo canguro reforzado.",
    category: "Hoodie",
    categorySlug: "hoodie",
    priceCents: 8000,
    currency: "PEN",
    images: [unsplashPhoto("photo-1542272604-787c3835535d")],
    sizes: POLERA_SIZES,
    featured: false,
  },
  {
    id: "9",
    slug: "polera-basica-negra",
    name: "Polera Básica Negra",
    description:
      "La esencial negra. Algodón peinado, cuello redondo, calce regular. Imprescindible en cualquier guardarropa.",
    category: "Básica",
    categorySlug: "basica",
    priceCents: 3500,
    currency: "PEN",
    images: [unsplashPhoto("photo-1583743814966-8936f5b7be1a")],
    sizes: POLERA_SIZES,
    featured: false,
  },
  {
    id: "10",
    slug: "polera-rayas-gris",
    name: "Polera Rayas Gris",
    description:
      "Polera de manga corta con rayas finas tejidas. Acabado suave y caída elegante.",
    category: "Estampada",
    categorySlug: "estampada",
    priceCents: 7000,
    currency: "PEN",
    images: [unsplashPhoto("photo-1622445275576-721325763afe")],
    sizes: POLERA_SIZES,
    featured: false,
  },
  {
    id: "11",
    slug: "polera-manga-larga-blanca",
    name: "Polera Manga Larga Blanca",
    description:
      "Manga larga blanca en jersey peinado. Perfecta para layering bajo poleras oversize.",
    category: "Manga Larga",
    categorySlug: "manga-larga",
    priceCents: 5500,
    currency: "PEN",
    images: [unsplashPhoto("photo-1581655353564-df123a1eb820")],
    sizes: POLERA_SIZES,
    featured: false,
  },
  {
    id: "12",
    slug: "polera-crop-negra",
    name: "Polera Crop Negra",
    description:
      "Crop top negro en jersey suave. Estilo minimalista y versátil.",
    category: "Crop",
    categorySlug: "crop",
    priceCents: 4500,
    currency: "PEN",
    images: [unsplashPhoto("photo-1618354691373-d851c5c3a990")],
    sizes: ["XS", "S", "M", "L"],
    featured: false,
  },
  {
    id: "13",
    slug: "buzo-baggy-negro",
    name: "Buzo Baggy Negro",
    description:
      "Buzo baggy con caída amplia y largo extendido. French terry pesado, cintura elástica con cordón mate.",
    category: "Buzo Baggy",
    categorySlug: "buzo-baggy",
    priceCents: 13000,
    currency: "PEN",
    images: [unsplashPhoto("photo-1517438476312-10d79c077509")],
    sizes: BUZO_SIZES,
    featured: true,
  },
  {
    id: "14",
    slug: "buzo-baggy-gris",
    name: "Buzo Baggy Gris",
    description:
      "Versión gris jaspeado. Pretina cómoda, bolsillos profundos y bota ancha — silueta streetwear actual.",
    category: "Buzo Baggy",
    categorySlug: "buzo-baggy",
    priceCents: 12500,
    currency: "PEN",
    images: [unsplashPhoto("photo-1556015048-4d3aa10df74c")],
    sizes: BUZO_SIZES,
    featured: false,
  },
  {
    id: "15",
    slug: "buzo-baggy-cargo-beige",
    name: "Buzo Baggy Cargo Beige",
    description:
      "Buzo baggy con bolsillos cargo. Algodón rugoso, calce holgado y bota recta. Edición limitada.",
    category: "Buzo Baggy",
    categorySlug: "buzo-baggy",
    priceCents: 13500,
    currency: "PEN",
    images: [unsplashPhoto("photo-1604176354204-9268737828e4")],
    sizes: BUZO_SIZES,
    featured: true,
  },
];

const NEW_IN_SLUGS = new Set<string>([
  "polera-oversize-negra",
  "polera-basica-blanca",
  "polera-hoodie-gris",
  "polera-estampada-huancayo",
  "buzo-baggy-negro",
  "buzo-baggy-cargo-beige",
]);

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function getProductsByCategorySlug(categorySlug: string): Product[] {
  if (categorySlug === "new-in") {
    return PRODUCTS.filter((p) => NEW_IN_SLUGS.has(p.slug));
  }
  return PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  );
}

export const CATEGORY_LABELS: Record<string, string> = {
  "new-in": "Novedades",
  oversize: "Oversize",
  basica: "Básicas",
  hoodie: "Hoodies",
  "manga-larga": "Manga Larga",
  crop: "Crop",
  estampada: "Estampadas",
  "buzo-baggy": "Buzos Baggy",
};
