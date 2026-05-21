"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { CartLine, Product } from "@/types/commerce";

const STORAGE_KEY = "jotape-textil-cart-v1";

function persistLines(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* ignore */
  }
}

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotalCents: number;
  addItem: (product: Product, size: string, quantity?: number) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineId(productSlug: string, size: string) {
  return `${productSlug}::${size}`;
}

function mergeAddItem(
  prev: CartLine[],
  product: Product,
  size: string,
  quantity: number,
): CartLine[] {
  const id = lineId(product.slug, size);
  const existing = prev.find((l) => l.id === id);
  if (existing) {
    return prev.map((l) =>
      l.id === id ? { ...l, quantity: l.quantity + quantity } : l,
    );
  }
  return [
    ...prev,
    {
      id,
      productSlug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      size,
      priceCents: product.priceCents,
      currency: product.currency,
      quantity,
    },
  ];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const linesRef = useRef<CartLine[]>([]);

  const commitLines = useCallback((next: CartLine[]) => {
    linesRef.current = next;
    persistLines(next);
    setLines(next);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) commitLines(parsed);
      }
    } catch {
      /* ignore */
    }
  }, [commitLines]);

  const addItem = useCallback(
    (product: Product, size: string, quantity: number = 1) => {
      commitLines(mergeAddItem(linesRef.current, product, size, quantity));
    },
    [commitLines],
  );

  const setQuantity = useCallback(
    (lid: string, quantity: number) => {
      const prev = linesRef.current;
      const next =
        quantity < 1
          ? prev.filter((l) => l.id !== lid)
          : prev.map((l) => (l.id === lid ? { ...l, quantity } : l));
      commitLines(next);
    },
    [commitLines],
  );

  const removeLine = useCallback(
    (lid: string) => {
      commitLines(linesRef.current.filter((l) => l.id !== lid));
    },
    [commitLines],
  );

  const clear = useCallback(() => {
    commitLines([]);
  }, [commitLines]);

  const value = useMemo(() => {
    const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotalCents = lines.reduce(
      (n, l) => n + l.priceCents * l.quantity,
      0,
    );
    return {
      lines,
      itemCount,
      subtotalCents,
      addItem,
      setQuantity,
      removeLine,
      clear,
    };
  }, [lines, addItem, setQuantity, removeLine, clear]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCartStore() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCartStore must be used within CartProvider");
  }
  return ctx;
}
