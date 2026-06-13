import Link from "next/link";
import { ScanLine } from "lucide-react";

import { BodyProfileForm } from "@/features/body-scan/body-profile-form";
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
          Captura, MediaPipe Pose y calibración del avatar 3D. Las medidas se
          pueden guardar en tu cuenta al aplicar el escaneo.
        </p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base">Perfil corporal</CardTitle>
          <CardDescription>
            Altura y peso usados para escalar medidas del escaneo y el recomendador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BodyProfileForm />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Captura guiada</CardTitle>
            <Badge className="bg-violet-600 text-white">Fases 1–3</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              Dos fotos de cuerpo completo (frontal y lateral) con instrucciones
              visuales. Las imágenes se guardan temporalmente en tu navegador.
            </CardDescription>
            <Button asChild className="rounded-full">
              <Link href="/account/measurements/scan">
                <ScanLine className="size-4" />
                Iniciar escaneo
              </Link>
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
