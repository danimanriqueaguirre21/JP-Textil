"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <Card className="border-zinc-200 shadow-lg dark:border-zinc-800">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl tracking-tight">
          Recuperar contraseña
        </CardTitle>
        <CardDescription>
          Te enviaremos un enlace cuando el backend de auth esté activo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!sent ? (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const email = String(fd.get("email") ?? "");
              await authService.requestPasswordReset(email);
              setSent(true);
            }}
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Correo
              </label>
              <Input name="email" type="email" required placeholder="tu@correo.com" />
            </div>
            <Button type="submit" className="w-full rounded-full">
              Enviar enlace
            </Button>
          </form>
        ) : (
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Si el correo existe, recibirás instrucciones (demo — sin envío real).
          </p>
        )}
        <p className="text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Volver al inicio de sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
