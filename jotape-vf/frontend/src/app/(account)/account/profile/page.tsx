"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountProfileFields } from "@/features/account";
import { useAuth } from "@/features/account/auth-provider";

export default function AccountProfilePage() {
  const { usuario } = useAuth();

  if (!usuario) return null;

  return (
    <div className="jp-animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Perfil
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Información de tu cuenta desde el backend. La edición llegará en una
          próxima versión.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos personales</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountProfileFields usuario={usuario} />
        </CardContent>
      </Card>
    </div>
  );
}
