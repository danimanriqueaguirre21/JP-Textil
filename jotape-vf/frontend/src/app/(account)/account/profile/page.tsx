"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AccountProfilePage() {
  return (
    <div className="jp-animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Perfil
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Datos locales demo — sincroniza con el módulo de usuarios (FastAPI).
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos personales</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid max-w-md gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Nombre
              </label>
              <Input placeholder="Tu nombre" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Correo
              </label>
              <Input type="email" placeholder="correo@ejemplo.com" />
            </div>
            <Button type="submit" className="mt-2 w-fit rounded-full">
              Guardar (demo)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
