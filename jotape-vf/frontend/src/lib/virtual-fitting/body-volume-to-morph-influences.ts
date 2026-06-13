import type { BodyVolumeParams } from "@/types/body-volume";
import type { BodyMorphInfluences } from "@/types/body-morph";
import {
  bodyFatToPreset,
  effectiveMuscleLevel,
  FAT_ZONE_WEIGHT,
} from "@/lib/virtual-fitting/body-volume-anatomy";

const MORPH_CLAMP = 0.24;

function toInfluence(delta: number): number {
  return Math.min(MORPH_CLAMP, Math.max(-MORPH_CLAMP, delta));
}

/** Morphs vf_*: grasa y músculo en canales separados. */
export function bodyVolumeToMorphInfluences(
  p: BodyVolumeParams,
): BodyMorphInfluences {
  const preset = p.preset ?? bodyFatToPreset(p.bodyFat);
  const fatCentered = p.bodyFat - 0.5;
  const torsoGain =
    preset === "obese" ? 1 : preset === "overweight" ? 0.85 : preset === "slim" ? -0.3 : 0.35;

  const effMuscle = effectiveMuscleLevel(p.muscle, p.bodyFat);
  const hipWidth = (p.hipWidth - 0.5) * 0.15 * (1 - p.bodyFat * 0.5);

  const belly = toInfluence(
    fatCentered * 0.95 * torsoGain * (FAT_ZONE_WEIGHT.abdomen / 0.5),
  );
  const waist = toInfluence(fatCentered * 0.75 * torsoGain);
  const hipMorph = toInfluence(
    fatCentered * 0.5 * torsoGain * (FAT_ZONE_WEIGHT.hips / 0.5) + hipWidth,
  );
  const arm = toInfluence(fatCentered * 0.08 + effMuscle * 0.25);
  const leg = toInfluence(
    fatCentered * 0.32 * torsoGain * (FAT_ZONE_WEIGHT.thigh / 0.5) + effMuscle * 0.2,
  );

  return {
    belly,
    chest: toInfluence(
      fatCentered * 0.55 * torsoGain * (FAT_ZONE_WEIGHT.chest / 0.5) + effMuscle * 0.35,
    ),
    waist,
    hip: hipMorph,
    arm,
    leg,
    neck: 0,
  };
}
