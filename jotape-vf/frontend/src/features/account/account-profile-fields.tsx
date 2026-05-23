"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { UsuarioPublico } from "@/types/auth";

function formatearFecha(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-PE", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type Props = {
  usuario: UsuarioPublico;
  soloLectura?: boolean;
};

export function AccountProfileFields({ usuario, soloLectura = true }: Props) {
  return (
    <div className="grid max-w-md gap-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Nombre completo
        </label>
        <Input
          readOnly={soloLectura}
          value={usuario.nombre_completo ?? ""}
          placeholder="Sin nombre"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Correo
        </label>
        <Input readOnly={soloLectura} type="email" value={usuario.email} />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Estado
        </label>
        <div>
          <Badge
            className={
              usuario.activo
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                : undefined
            }
          >
            {usuario.activo ? "Activa" : "Inactiva"}
          </Badge>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Miembro desde
        </label>
        <Input readOnly value={formatearFecha(usuario.creado_en)} />
      </div>
      <p className="text-xs text-zinc-500">
        ID: <span className="font-mono text-zinc-600 dark:text-zinc-400">{usuario.id}</span>
      </p>
    </div>
  );
}
