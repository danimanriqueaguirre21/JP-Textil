import type {
  ErrorApi,
  TokenRespuesta,
  UsuarioCrear,
  UsuarioPublico,
} from "@/types/auth";

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as ErrorApi;
    return data.error?.message ?? `Error ${res.status}`;
  } catch {
    return `Error ${res.status}: ${res.statusText}`;
  }
}

async function bffPost(path: string, body: unknown): Promise<Response> {
  return fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const authService = {
  async registrar(datos: UsuarioCrear): Promise<UsuarioPublico> {
    const res = await bffPost("/api/auth/register", {
      email: datos.email,
      contrasena: datos.contrasena,
      nombre_completo: datos.nombre_completo ?? null,
    });
    if (!res.ok) {
      throw new Error(await parseError(res));
    }
    return res.json() as Promise<UsuarioPublico>;
  },

  async iniciarSesion(email: string, contrasena: string): Promise<TokenRespuesta> {
    const res = await bffPost("/api/auth/login", { email, contrasena });
    if (!res.ok) {
      throw new Error(await parseError(res));
    }
    return { access_token: "cookie", token_type: "bearer" };
  },

  async registrarEIniciarSesion(datos: UsuarioCrear): Promise<UsuarioPublico> {
    const usuario = await this.registrar(datos);
    await this.iniciarSesion(datos.email, datos.contrasena);
    return usuario;
  },

  async obtenerPerfil(): Promise<UsuarioPublico> {
    const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
    if (!res.ok) {
      throw new Error(await parseError(res));
    }
    return res.json() as Promise<UsuarioPublico>;
  },

  async cerrarSesion(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  },

  async tieneSesion(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      // Sin sesión, API aún compilando o backend apagado — no romper la UI.
      return false;
    }
  },

  async solicitarRestablecimientoContrasena(_email: string): Promise<{ ok: boolean }> {
    await new Promise((r) => setTimeout(r, 400));
    return { ok: true };
  },
};
