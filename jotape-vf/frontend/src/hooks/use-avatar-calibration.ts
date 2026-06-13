"use client";

import { useCallback, useEffect, useState } from "react";

import {
  CALIBRATION_UPDATED_EVENT,
  clearAvatarCalibration,
  loadAvatarCalibration,
  saveAvatarCalibration,
} from "@/lib/body-scan/avatar-calibration-storage";
import type { AvatarCalibration } from "@/types/avatar-calibration";

export function useAvatarCalibration() {
  const [calibration, setCalibration] = useState<AvatarCalibration | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setCalibration(loadAvatarCalibration());
    setHydrated(true);
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(CALIBRATION_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CALIBRATION_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const apply = useCallback((next: AvatarCalibration) => {
    saveAvatarCalibration(next);
    setCalibration(next);
  }, []);

  const clear = useCallback(() => {
    clearAvatarCalibration();
    setCalibration(null);
  }, []);

  return { calibration, hydrated, apply, clear, refresh };
}
