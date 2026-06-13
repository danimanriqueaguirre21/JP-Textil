import type { BodyProfile } from "@/types/body-profile";

const STORAGE_KEY = "jotape-body-profile-v1";

export const DEFAULT_BODY_PROFILE: BodyProfile = {
  heightCm: 170,
  weightKg: 70,
  updatedAt: new Date(0).toISOString(),
};

export function loadBodyProfile(): BodyProfile {
  if (typeof window === "undefined") return { ...DEFAULT_BODY_PROFILE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BODY_PROFILE };
    const parsed = JSON.parse(raw) as BodyProfile;
    if (
      typeof parsed.heightCm === "number" &&
      typeof parsed.weightKg === "number"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_BODY_PROFILE };
}

export function saveBodyProfile(profile: BodyProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent("jotape-body-profile-updated"));
}
