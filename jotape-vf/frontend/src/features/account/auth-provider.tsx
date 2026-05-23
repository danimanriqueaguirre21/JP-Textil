"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { limpiarTokenLegacy } from "@/lib/auth-token";
import { authService } from "@/services/auth.service";
import type { UsuarioPublico } from "@/types/auth";

type AuthContextValue = {
  usuario: UsuarioPublico | null;
  cargando: boolean;
  error: string | null;
  autenticado: boolean;
  recargar: () => Promise<void>;
  cerrarSesion: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioPublico | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    limpiarTokenLegacy();
    try {
      const perfil = await authService.obtenerPerfil();
      setUsuario(perfil);
    } catch (err) {
      setUsuario(null);
      setError(err instanceof Error ? err.message : "Sesión no válida");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const cerrarSesion = useCallback(() => {
    void authService.cerrarSesion().finally(() => {
      limpiarTokenLegacy();
      setUsuario(null);
      router.push("/login");
      router.refresh();
    });
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      cargando,
      error,
      autenticado: usuario !== null,
      recargar,
      cerrarSesion,
    }),
    [usuario, cargando, error, recargar, cerrarSesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
