export type Currency = "PEN" | "USD";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  priceCents: number;
  currency: Currency;
  images: string[];
  sizes: string[];
  featured?: boolean;
};

export type CartLine = {
  id: string;
  productSlug: string;
  name: string;
  image: string;
  size: string;
  priceCents: number;
  currency: Currency;
  quantity: number;
};
