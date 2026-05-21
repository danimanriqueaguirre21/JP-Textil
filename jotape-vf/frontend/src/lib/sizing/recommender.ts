/**
 * Size recommender — heuristic v0 (frontend-only).
 *
 * Mock que reemplazaremos por el modelo ML real (RF-08).
 * La lógica está aislada y devuelve una talla discreta + nivel de confianza
 * + medidas estimadas. Útil para iterar la UX sin esperar al backend de IA.
 */

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export type Fit = "slim" | "regular" | "oversize";
export type Gender = "male" | "female" | "unisex";

export type SizeInput = {
  heightCm: number;
  weightKg: number;
  fit: Fit;
  gender: Gender;
};

export type SizeResult = {
  size: Size;
  confidence: number;
  bmi: number;
  estChestCm: number;
  rationale: string[];
};

const FIT_OFFSET: Record<Fit, number> = {
  slim: -0.5,
  regular: 0,
  oversize: 1,
};

const GENDER_WEIGHT_BIAS: Record<Gender, number> = {
  female: -0.4,
  unisex: 0,
  male: 0.2,
};

/**
 * Estimación gruesa de contorno de pecho a partir de peso y altura.
 * Aproximación inspirada en tablas antropométricas; sustituible por modelo ML.
 */
function estimateChestCm({ heightCm, weightKg, gender }: SizeInput): number {
  const heightTerm = (heightCm - 170) * 0.35;
  const weightTerm = (weightKg - 65) * 0.7;
  const base = 96 + heightTerm + weightTerm;
  const genderAdj = gender === "female" ? -3 : gender === "male" ? 1 : 0;
  return Math.round(base + genderAdj);
}

/** Convierte un score continuo en talla discreta y confianza. */
function scoreToSize(score: number): { size: Size; confidence: number } {
  const clamped = Math.max(0, Math.min(SIZES.length - 1, score));
  const idx = Math.round(clamped);
  // distance to the rounded bucket -> closer = more confident
  const distance = Math.abs(clamped - idx);
  const confidence = Math.max(0.55, Math.min(0.97, 1 - distance * 0.6));
  return { size: SIZES[idx], confidence };
}

export function recommendSize(input: SizeInput): SizeResult {
  const { heightCm, weightKg, fit, gender } = input;

  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  const estChestCm = estimateChestCm(input);

  // Score continuo en el espacio de tallas. 0 ≈ XS, 4 ≈ XL.
  const weightScore = (weightKg - 50) / 8.5;
  const heightAdjust = ((heightCm - 168) / 16) * 0.4;
  const fitOffset = FIT_OFFSET[fit];
  const genderBias = GENDER_WEIGHT_BIAS[gender];

  const score = weightScore + heightAdjust + fitOffset + genderBias;
  const { size, confidence } = scoreToSize(score);

  const rationale = [
    `BMI estimado ${bmi.toFixed(1)} (peso/altura).`,
    `Contorno de pecho ≈ ${estChestCm} cm.`,
    fit === "oversize"
      ? "Calce oversize → talla escalada +1 para hombros caídos."
      : fit === "slim"
        ? "Calce slim → media talla menos para silueta ajustada."
        : "Calce regular → recomendación estándar.",
  ];

  return { size, confidence, bmi, estChestCm, rationale };
}

/** Mapea cm de pecho a una talla aprox. (útil para mostrar tabla). */
export const CHEST_TABLE: { size: Size; minChest: number; maxChest: number }[] =
  [
    { size: "XS", minChest: 84, maxChest: 90 },
    { size: "S", minChest: 91, maxChest: 96 },
    { size: "M", minChest: 97, maxChest: 102 },
    { size: "L", minChest: 103, maxChest: 109 },
    { size: "XL", minChest: 110, maxChest: 118 },
  ];
