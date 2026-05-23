"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/account/auth-provider";

export default function AccountDashboardPage() {
  const { usuario } = useAuth();
  const nombre =
    usuario?.nombre_completo?.trim() || usuario?.email?.split("@")[0] || "usuario";

  return (
    <div className="space-y-8 jp-animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Hola, {nombre}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sesión conectada a FastAPI · {usuario?.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="jp-hover-lift border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <CardTitle className="text-base">Pedidos</CardTitle>
            <Badge className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              RF-06
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <CardDescription>
              Seguimiento y historial cuando el módulo de pedidos esté en
              producción.
            </CardDescription>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/account/orders">
                Ver pedidos <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="jp-hover-lift border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <CardTitle className="text-base">Medidas</CardTitle>
            <Badge>IA</Badge>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <CardDescription>
              Visión computacional y talla recomendada — área reservada para
              integración.
            </CardDescription>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/account/measurements">
                <Sparkles className="size-4" /> Configurar medidas
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="jp-hover-lift border-zinc-200 dark:border-zinc-800 sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Perfil</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="mb-3">
              Datos sincronizados desde{" "}
              <code className="text-xs">GET /users/me</code>.
            </CardDescription>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/account/profile">Ver perfil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
