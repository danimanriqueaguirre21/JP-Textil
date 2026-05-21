import type { Fit } from "@/lib/sizing/recommender";

export type PredictionApiResponse = {
  size: string;
  confidence: number;
  model_version: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

/** Refuerza recomendación con el endpoint ML del backend (opcional). */
export async function fetchSizePrediction(input: {
  height_cm: number;
  weight_kg: number;
  fit: Fit;
}): Promise<PredictionApiResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/predictions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    return (await res.json()) as PredictionApiResponse;
  } catch {
    return null;
  }
}
