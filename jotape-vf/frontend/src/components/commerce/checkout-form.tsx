"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";

export function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotalCents, clear } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (lines.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No hay productos en tu bolsa.{" "}
        <a href="/catalog" className="font-medium underline-offset-4 hover:underline">
          Ir al catálogo
        </a>
      </p>
    );
  }

  const currency = lines[0]?.currency ?? "PEN";

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        clear();
        router.push("/checkout/success");
      }}
    >
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="flex justify-between">
          <span className="text-zinc-600 dark:text-zinc-400">Total</span>
          <span
            data-testid="checkout-total"
            className="font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {formatMoney(subtotalCents, currency)}
          </span>
        </div>
        <ul className="mt-3 space-y-1 border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-700">
          {lines.map((l) => (
            <li key={l.id}>
              {l.name} · {l.size} × {l.quantity}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">Nombre</span>
          <input
            data-testid="checkout-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="Tu nombre"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">Correo</span>
          <input
            data-testid="checkout-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="tu@correo.com"
          />
        </label>
      </div>

      <Button
        type="submit"
        data-testid="checkout-submit"
        className="w-full rounded-full"
      >
        Confirmar pedido
      </Button>
    </form>
  );
}
