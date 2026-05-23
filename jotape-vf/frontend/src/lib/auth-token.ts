/** Limpia token legacy en localStorage (migración a cookie HttpOnly). */
const LEGACY_KEY = "jotape_access_token";

export function limpiarTokenLegacy(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGACY_KEY);
}
