import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccountMeasurementsPage() {
  return (
    <div className="jp-animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Medidas corporales
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Zona reservada para visión computacional (MediaPipe / OpenCV) y
          predicción de talla (PyTorch). RF-07 · RF-08 · RF-09.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Captura guiada</CardTitle>
            <Badge>CV</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              Flujo de cámara con validación de pose y extracción de landmarks —
              componente frontend pendiente de API de inferencia.
            </CardDescription>
            <Button disabled className="rounded-full" variant="outline">
              Abrir cámara (próximamente)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Recomendación de talla</CardTitle>
            <Badge className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              ML
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              El modelo consumirá medidas y tabla de tallas por prenda. Esta UI
              enlazará resultados en PDP y checkout.
            </CardDescription>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/catalog">Ir al catálogo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
