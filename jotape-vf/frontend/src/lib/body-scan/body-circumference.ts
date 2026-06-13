/** Zona corporal para estimación de circunferencia desde silueta. */
export type BodyMeasureZone = "chest" | "waist" | "hip";

export const CORRECTION_FACTOR: Record<BodyMeasureZone, number> = {
  chest: 0.85,
  waist: 0.75,
  hip: 0.8,
};

export const ANATOMICAL_MAX_CM: Record<BodyMeasureZone, number> = {
  chest: 170,
  waist: 160,
  hip: 170,
};

export type ZoneCircumferenceResult = {
  zone: BodyMeasureZone;
  frontWidthCm: number;
  sideDepthCm: number;
  circumferenceRawCm: number;
  circumferenceCorrectedCm: number;
  correctionFactor: number;
  suspiciousMeasurement: boolean;
  /** Mezcla con estimación BMI si la medida era sospechosa. */
  bmiAdjusted: boolean;
};

/**
 * Circunferencia elíptica corregida:
 * π × √(2 × (semiAncho² + semiProfundidad²))
 */
export function ellipseCircumferenceRawCm(
  frontWidthCm: number,
  sideDepthCm: number,
): number {
  const semiW = Math.max(frontWidthCm, 1) / 2;
  const semiD = Math.max(sideDepthCm, 1) / 2;
  const raw = Math.PI * Math.sqrt(2 * (semiW * semiW + semiD * semiD));
  return Math.round(raw * 10) / 10;
}

/** Profundidad estimada cuando no hay vista lateral fiable. */
export function estimateSideDepthCm(
  frontWidthCm: number,
  zone: BodyMeasureZone,
): number {
  const ratio = zone === "waist" ? 0.46 : zone === "hip" ? 0.4 : 0.36;
  return Math.round(frontWidthCm * ratio * 10) / 10;
}

/** Limita profundidad lateral vs ancho frontal (evita doble conteo). */
export function clampSideDepth(
  frontWidthCm: number,
  sideDepthCm: number,
): number {
  if (sideDepthCm <= 0) return estimateSideDepthCm(frontWidthCm, "waist");
  const maxDepth = frontWidthCm * 0.62;
  return Math.round(Math.min(sideDepthCm, maxDepth) * 10) / 10;
}

/** Estimación orientativa por IMC + altura (no precisión médica). */
export function estimateCircumferenceFromBMI(
  zone: BodyMeasureZone,
  heightCm: number,
  weightKg: number,
): number {
  const hM = heightCm / 100;
  const bmi = weightKg / (hM * hM);
  const bmiExcess = Math.max(0, bmi - 22);

  if (zone === "waist") {
    return Math.round(
      clamp(heightCm * 0.52 + bmiExcess * 1.65, 100, 130),
    );
  }
  if (zone === "chest") {
    return Math.round(
      clamp(heightCm * 0.62 + bmiExcess * 1.45, 105, 145),
    );
  }
  return Math.round(
    clamp(heightCm * 0.58 + bmiExcess * 1.55, 100, 140),
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Limita ancho frontal de cintura (máscara puede incluir brazos/ropa). */
export function clampFrontWidthForZone(
  zone: BodyMeasureZone,
  frontWidthCm: number,
  context: {
    shoulderWidthCm?: number;
    hipFrontWidthCm?: number;
    chestFrontWidthCm?: number;
  },
): number {
  let w = frontWidthCm;
  const shoulder = context.shoulderWidthCm ?? 0;
  const hip = context.hipFrontWidthCm ?? 0;
  const chest = context.chestFrontWidthCm ?? 0;

  if (zone === "waist") {
    if (hip > 0) w = Math.min(w, hip * 1.06);
    if (shoulder > 0) w = Math.min(w, shoulder * 1.42);
    if (chest > 0) w = Math.min(w, chest * 1.02);
  }
  if (zone === "chest" && shoulder > 0) {
    w = Math.min(w, shoulder * 1.55);
  }
  if (zone === "hip" && shoulder > 0) {
    w = Math.min(w, shoulder * 1.65);
  }

  return Math.round(w * 10) / 10;
}

export function computeCorrectedCircumference(input: {
  zone: BodyMeasureZone;
  frontWidthCm: number;
  sideDepthCm?: number;
  heightCm?: number;
  weightKg?: number;
  shoulderWidthCm?: number;
  hipFrontWidthCm?: number;
  chestFrontWidthCm?: number;
}): ZoneCircumferenceResult {
  const factor = CORRECTION_FACTOR[input.zone];

  const frontWidthCm = clampFrontWidthForZone(input.zone, input.frontWidthCm, {
    shoulderWidthCm: input.shoulderWidthCm,
    hipFrontWidthCm: input.hipFrontWidthCm,
    chestFrontWidthCm: input.chestFrontWidthCm,
  });

  const sideDepthCm =
    input.sideDepthCm && input.sideDepthCm > 5
      ? clampSideDepth(frontWidthCm, input.sideDepthCm)
      : estimateSideDepthCm(frontWidthCm, input.zone);

  const circumferenceRawCm = ellipseCircumferenceRawCm(frontWidthCm, sideDepthCm);
  let circumferenceCorrectedCm = Math.round(circumferenceRawCm * factor);

  let suspiciousMeasurement =
    circumferenceCorrectedCm > ANATOMICAL_MAX_CM[input.zone] ||
    circumferenceRawCm > ANATOMICAL_MAX_CM[input.zone] * 1.15;

  let bmiTarget: number | undefined;
  if (
    input.heightCm &&
    input.heightCm > 0 &&
    input.weightKg &&
    input.weightKg > 0
  ) {
    bmiTarget = estimateCircumferenceFromBMI(
      input.zone,
      input.heightCm,
      input.weightKg,
    );
    const bmiSlackCm = input.zone === "waist" ? 12 : 15;
    if (circumferenceCorrectedCm > bmiTarget + bmiSlackCm) {
      suspiciousMeasurement = true;
    }
  }

  let bmiAdjusted = false;
  if (suspiciousMeasurement && bmiTarget !== undefined) {
    circumferenceCorrectedCm = Math.round(
      circumferenceCorrectedCm * 0.35 + bmiTarget * 0.65,
    );
    bmiAdjusted = true;
    suspiciousMeasurement =
      circumferenceCorrectedCm > ANATOMICAL_MAX_CM[input.zone];
  }

  circumferenceCorrectedCm = Math.min(
    circumferenceCorrectedCm,
    ANATOMICAL_MAX_CM[input.zone],
  );

  return {
    zone: input.zone,
    frontWidthCm,
    sideDepthCm,
    circumferenceRawCm,
    circumferenceCorrectedCm,
    correctionFactor: factor,
    suspiciousMeasurement,
    bmiAdjusted,
  };
}

export function logZoneCircumferenceDebug(
  label: string,
  result: ZoneCircumferenceResult,
): void {
  if (typeof window === "undefined") return;
  const prefix =
    result.zone === "waist"
      ? "waist"
      : result.zone === "chest"
        ? "chest"
        : "hip";
  console.table({
    [`${prefix}FrontWidthCm`]: result.frontWidthCm,
    [`${prefix}SideDepthCm`]: result.sideDepthCm,
    [`${prefix}CircumferenceRawCm`]: result.circumferenceRawCm,
    [`${prefix}CircumferenceCorrectedCm`]: result.circumferenceCorrectedCm,
    correctionFactor: result.correctionFactor,
    suspiciousMeasurement: result.suspiciousMeasurement,
    bmiAdjusted: result.bmiAdjusted,
    label,
  });
}

/** @deprecated Usar computeCorrectedCircumference */
export function estimateCircumferenceCm(
  widthCm: number,
  depthCm: number,
): number {
  const raw = ellipseCircumferenceRawCm(widthCm, depthCm || estimateSideDepthCm(widthCm, "waist"));
  return Math.round(raw * CORRECTION_FACTOR.waist);
}
