import type { Metadata } from "next";

import { CartView } from "@/components/commerce/cart-view";

export const metadata: Metadata = {
  title: "Bolsa de compras — JotaPe Textil",
  description: "Revisa tus prendas antes de finalizar la compra.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Tu bolsa
      </h1>
      <CartView />
    </div>
  );
}
