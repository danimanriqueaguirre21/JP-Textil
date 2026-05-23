import type { Fit } from "@/lib/sizing/recommender";

export type PredictionApiResponse = {
  size: string;
  confidence: number;
  model_version: string;
};

/** Predicción ML vía BFF Next.js → FastAPI (mismo origen, sin CORS al backend). */
export async function fetchSizePrediction(input: {
  height_cm: number;
  weight_kg: number;
  fit: Fit;
}): Promise<PredictionApiResponse | null> {
  try {
    const res = await fetch("/api/predictions", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    return (await res.json()) as PredictionApiResponse;
  } catch {
    return null;
  }
}
