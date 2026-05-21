"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <Card className="border-zinc-200 shadow-lg dark:border-zinc-800">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl tracking-tight">Iniciar sesión</CardTitle>
        <CardDescription>
          RF-02 · Conecta JWT / FastAPI cuando esté disponible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Correo
            </label>
            <Input
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Contraseña
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input type="password" autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full rounded-full">
            Continuar
          </Button>
        </form>
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Registrarse
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
