import type { BodyScanSession } from "@/types/body-scan";

const STORAGE_KEY = "jotape-body-scan-session-v1";

export function loadBodyScanSession(): BodyScanSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BodyScanSession;
  } catch {
    return null;
  }
}

export function saveBodyScanSession(session: BodyScanSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // QuotaExceededError: imágenes muy grandes; la sesión sigue en memoria.
  }
}

export function clearBodyScanSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function createEmptyBodyScanSession(): BodyScanSession {
  const now = new Date().toISOString();
  return {
    id: newSessionId(),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}
