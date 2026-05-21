"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";

export function CartView() {
  const { lines, subtotalCents, setQuantity, removeLine } = useCart();

  if (lines.length === 0) {
    return (
      <div data-testid="cart-page">
        <p
          data-testid="cart-empty"
          className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400"
        >
          Tu bolsa está vacía.{" "}
          <Link
            href="/catalog"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Ver catálogo
          </Link>
        </p>
      </div>
    );
  }

  const currency = lines[0]?.currency ?? "PEN";

  return (
    <div data-testid="cart-page" className="space-y-8">
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex gap-4 py-6 first:pt-0 last:pb-0"
            data-testid="cart-line"
          >
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
              {line.image ? (
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
              <div>
                <p
                  data-testid="cart-line-name"
                  className="font-medium text-zinc-900 dark:text-zinc-50"
                >
                  {line.name}
                </p>
                <p className="text-xs text-zinc-500">
                  Talla {line.size} · {formatMoney(line.priceCents, line.currency)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Cant.
                  <select
                    value={line.quantity}
                    onChange={(e) =>
                      setQuantity(line.id, Number.parseInt(e.target.value, 10))
                    }
                    className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    aria-label={`Cantidad de ${line.name}`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  data-testid="cart-remove"
                  onClick={() => removeLine(line.id)}
                  className="text-xs font-medium text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-50"
                >
                  Quitar
                </button>
              </div>
            </div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {formatMoney(line.priceCents * line.quantity, line.currency)}
            </p>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
          <span
            data-testid="cart-subtotal"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {formatMoney(subtotalCents, currency)}
          </span>
        </div>
        <Button asChild className="mt-6 w-full rounded-full">
          <Link href="/checkout" data-testid="go-checkout">
            Finalizar compra
          </Link>
        </Button>
      </div>
    </div>
  );
}
