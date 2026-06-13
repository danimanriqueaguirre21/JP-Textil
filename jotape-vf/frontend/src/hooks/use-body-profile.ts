"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_BODY_PROFILE,
  loadBodyProfile,
  saveBodyProfile,
} from "@/lib/body-scan/body-profile-storage";
import type { BodyProfile } from "@/types/body-profile";

const PROFILE_EVENT = "jotape-body-profile-updated";

export function useBodyProfile() {
  const [profile, setProfile] = useState<BodyProfile>(DEFAULT_BODY_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setProfile(loadBodyProfile());
    setHydrated(true);
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(PROFILE_EVENT, onUpdate);
    return () => window.removeEventListener(PROFILE_EVENT, onUpdate);
  }, [refresh]);

  const update = useCallback((partial: Partial<BodyProfile>) => {
    const next: BodyProfile = {
      ...loadBodyProfile(),
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    saveBodyProfile(next);
    setProfile(next);
    return next;
  }, []);

  return { profile, hydrated, update, refresh };
}
