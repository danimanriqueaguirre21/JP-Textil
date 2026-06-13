import type { AvatarCalibration } from "@/types/avatar-calibration";
import type { MedidaUsuarioApi } from "@/types/body-profile";

export async function fetchCurrentMeasurements(): Promise<MedidaUsuarioApi | null> {
  const res = await fetch("/api/measurements", {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error("No se pudieron cargar las medidas guardadas.");
  }
  return res.json() as Promise<MedidaUsuarioApi>;
}

export async function saveMeasurementsFromCalibration(
  calibration: AvatarCalibration,
): Promise<MedidaUsuarioApi> {
  const res = await fetch("/api/measurements", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      altura_cm: calibration.heightCm,
      peso_kg: calibration.weightKg,
      pecho_cm: calibration.chestCm,
      cintura_cm: calibration.waistCm,
      cadera_cm: calibration.hipWidthCm,
      hombro_cm: calibration.shoulderWidthCm,
      fuente: "body_scan",
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(
      data.error?.message ?? "No se pudieron guardar las medidas en el servidor.",
    );
  }

  return res.json() as Promise<MedidaUsuarioApi>;
}
