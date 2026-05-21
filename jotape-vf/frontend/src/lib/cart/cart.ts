import type { CartLine, Currency, Product } from "@/types/commerce";

export const CART_STORAGE_KEY = "jotape-cart";

export function createCartLine(
  product: Product,
  size: string,
  quantity = 1,
): CartLine {
  return {
    id: `${product.slug}-${size}`,
    productSlug: product.slug,
    name: product.name,
    image: product.images[0] ?? "",
    size,
    priceCents: product.priceCents,
    currency: product.currency,
    quantity,
  };
}

export function addLine(
  lines: CartLine[],
  product: Product,
  size: string,
  quantity = 1,
): CartLine[] {
  const id = `${product.slug}-${size}`;
  const existing = lines.find((l) => l.id === id);
  if (existing) {
    return lines.map((l) =>
      l.id === id ? { ...l, quantity: l.quantity + quantity } : l,
    );
  }
  return [...lines, createCartLine(product, size, quantity)];
}

export function removeLine(lines: CartLine[], lineId: string): CartLine[] {
  return lines.filter((l) => l.id !== lineId);
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function cartSubtotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);
}

export function parseCartJson(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as { lines?: CartLine[] };
    return Array.isArray(data.lines) ? data.lines : [];
  } catch {
    return [];
  }
}

export function serializeCart(lines: CartLine[]): string {
  return JSON.stringify({ lines });
}

export function cartCurrency(lines: CartLine[]): Currency {
  return lines[0]?.currency ?? "PEN";
}
