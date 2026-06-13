import { REFERENCE_ANTHRO } from "@/lib/body-scan/avatar-zone-scales";
import type { BodyType, HybridBodyEstimate } from "@/types/hybrid-body-scan";

export type BodyClassificationInput = {
  heightCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
  depthCm: number;
  abdomenDepthCm: number;
  shoulderWidthCm: number;
  weightKg?: number;
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function computeBMI(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const hM = heightCm / 100;
  return Math.round((weightKg / (hM * hM)) * 10) / 10;
}

export function computeBodyFatEstimate(input: BodyClassificationInput): number {
  const ref = REFERENCE_ANTHRO;
  const waistRatio = input.waistCm / ref.waist;
  const depthRatio = input.abdomenDepthCm / ref.depth;
  const waistHeight = input.waistCm / Math.max(input.heightCm, 120);
  const chestWaist = input.chestCm / Math.max(input.waistCm, 1);

  let bmiFactor = 0;
  if (input.weightKg && input.weightKg > 0 && input.heightCm > 0) {
    const bmi = computeBMI(input.weightKg, input.heightCm);
    bmiFactor = clamp((bmi - 22) / 18, 0, 1) * 0.35;
  }

  const raw =
    clamp(waistRatio - 1, -0.2, 0.55) * 0.32 +
    clamp(depthRatio - 1, -0.15, 0.65) * 0.24 +
    clamp(waistHeight * 10 - 4.2, -0.2, 0.5) * 0.2 +
    clamp(1.35 - chestWaist, -0.2, 0.35) * 0.1 +
    bmiFactor;

  return Math.round(clamp(raw, 0, 1) * 100) / 100;
}

export function classifyBodyType(
  input: BodyClassificationInput,
  bodyFatEstimate: number,
): BodyType {
  const { waistCm, shoulderWidthCm, chestCm, heightCm, weightKg } = input;
  const bmi =
    weightKg && weightKg > 0 && heightCm > 0
      ? computeBMI(weightKg, heightCm)
      : null;

  if (bmi !== null && bmi >= 35) return "OBESE";
  if (bmi !== null && bmi >= 30) return "OVERWEIGHT";
  if (waistCm > 110 || bodyFatEstimate >= 0.72) return "OBESE";
  if (waistCm >= 95 || bodyFatEstimate >= 0.55) return "OVERWEIGHT";

  const shoulderChest = shoulderWidthCm / Math.max(chestCm * 0.46, 1);

  if (
    waistCm < 75 &&
    bodyFatEstimate < 0.28 &&
    shoulderChest < 1.05 &&
    (bmi === null || bmi < 22)
  ) {
    return "SLIM";
  }

  if (
    waistCm < 82 &&
    bodyFatEstimate < 0.38 &&
    shoulderChest >= 1.08 &&
    (bmi === null || bmi < 25)
  ) {
    return "ATHLETIC";
  }

  if (bmi !== null && bmi >= 25) return "OVERWEIGHT";

  return "AVERAGE";
}

export function buildHybridBodyEstimate(
  input: BodyClassificationInput & { thighWidthCm: number },
): HybridBodyEstimate {
  const bodyFatEstimate = computeBodyFatEstimate(input);
  const bodyType = classifyBodyType(input, bodyFatEstimate);

  return {
    chestCm: input.chestCm,
    waistCm: input.waistCm,
    hipCm: input.hipCm,
    depthCm: input.depthCm,
    abdomenDepthCm: input.abdomenDepthCm,
    thighWidthCm: input.thighWidthCm,
    bodyFatEstimate,
    bodyType,
  };
}

export function logBodyClassification(
  estimate: HybridBodyEstimate,
  input?: BodyClassificationInput,
): void {
  if (typeof window === "undefined") return;
  const bmi =
    input?.weightKg && input.heightCm
      ? computeBMI(input.weightKg, input.heightCm)
      : null;
  console.table({
    BMI: bmi ?? "—",
    bodyType: estimate.bodyType,
    bodyFatEstimate: estimate.bodyFatEstimate,
    pecho_estimado_cm: estimate.chestCm,
    cintura_estimada_cm: estimate.waistCm,
    cadera_estimada_cm: estimate.hipCm,
    profundidad_torso_cm: estimate.depthCm,
    profundidad_abdomen_cm: estimate.abdomenDepthCm,
  });
}
