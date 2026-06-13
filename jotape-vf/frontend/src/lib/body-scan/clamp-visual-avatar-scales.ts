/**
 * @deprecated Usar body-visual-presets.ts (presets + mezcla 75/25).
 */
export {
  resolveAvatarVisualScales,
  MEASURED_BLEND_WEIGHT,
  getBodyVisualPreset,
  BODY_VISUAL_PRESETS,
  type VisualScaleResolution,
} from "@/lib/body-scan/body-visual-presets";

/** @deprecated Mantener solo para tests legacy. */
export { clampMeasuredScales as clampVisualAvatarScales } from "@/lib/body-scan/body-visual-presets";
