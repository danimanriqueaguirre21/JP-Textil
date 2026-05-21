import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Gracias por tu compra — JotaPe Textil",
  description: "Tu pedido fue registrado (demo).",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <h1
        data-testid="checkout-success"
        className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        Pedido confirmado
      </h1>
      <p className="mt-2 text-lg text-zinc-700 dark:text-zinc-300">
        ¡Gracias por tu compra!
      </p>
      <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Esta es una vitrina de demostración — no se generó ningún cobro. En
        producción aquí verías tu número de pedido y un correo de confirmación.
      </p>
      <Button asChild className="mt-8 rounded-full">
        <Link href="/catalog">Seguir comprando</Link>
      </Button>
    </div>
  );
}
