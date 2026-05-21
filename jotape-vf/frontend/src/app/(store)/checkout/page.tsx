import type { Metadata } from "next";
import Link from "next/link";

import { CheckoutForm } from "@/components/commerce/checkout-form";

export const metadata: Metadata = {
  title: "Finalizar compra — JotaPe Textil",
  description: "Completa tu pedido.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="mb-8 text-xs text-zinc-500">
        <Link href="/cart" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Bolsa
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-50">Finalizar compra</span>
      </nav>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Finalizar compra
      </h1>
      <CheckoutForm />
    </div>
  );
}
