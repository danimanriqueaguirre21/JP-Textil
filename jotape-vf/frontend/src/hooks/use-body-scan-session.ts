"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createEmptyBodyScanSession,
  loadBodyScanSession,
  saveBodyScanSession,
} from "@/lib/body-scan/scan-session-storage";
import type {
  BodyScanImageCapture,
  BodyScanSession,
  BodyScanView,
} from "@/types/body-scan";

export function useBodyScanSession() {
  const [session, setSession] = useState<BodyScanSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadBodyScanSession();
    setSession(stored ?? createEmptyBodyScanSession());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: BodyScanSession) => {
    setSession(next);
    saveBodyScanSession(next);
  }, []);

  const setCapture = useCallback(
    (view: BodyScanView, capture: BodyScanImageCapture) => {
      setSession((prev) => {
        if (!prev) return prev;
        const next: BodyScanSession = {
          ...prev,
          [view]: capture,
          status:
            view === "side" || (view === "front" && prev.side)
              ? "complete"
              : "capturing",
          updatedAt: new Date().toISOString(),
        };
        saveBodyScanSession(next);
        return next;
      });
    },
    [],
  );

  const clearCapture = useCallback((view: BodyScanView) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [view]: undefined, status: "capturing" as const };
      saveBodyScanSession(next);
      return next;
    });
  }, []);

  const resetSession = useCallback(() => {
    const fresh = createEmptyBodyScanSession();
    persist(fresh);
  }, [persist]);

  return {
    session,
    hydrated,
    setCapture,
    clearCapture,
    resetSession,
  };
}
