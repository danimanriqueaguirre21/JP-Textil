import { Package } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccountOrdersPage() {
  return (
    <div className="jp-animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pedidos
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Aquí aparecerá el historial al conectar el backend de pedidos y pagos.
        </p>
      </div>
      <Card className="border-dashed border-zinc-300 dark:border-zinc-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Package className="size-8 text-zinc-400" />
            <div>
              <CardTitle className="text-base">Sin pedidos aún</CardTitle>
              <CardDescription>
                Cuando completes un checkout demo o uno real, los pedidos se
                listarán en esta vista.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
