"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Loader2 } from "lucide-react";

import { GlassPanel } from "@/components/try-on/try-on-ui";
import { Button } from "@/components/ui/button";
import { useOptionalAuth } from "@/features/account/auth-provider";
import { authService } from "@/services/auth.service";
import { buildAvatarCalibration, saveAvatarCalibration } from "@/lib/body-scan/avatar-calibration-storage";
import { buildBodyScanDiagnosticReport } from "@/lib/body-scan/build-body-scan-diagnostic";
import { isBodyScanDiagnosticMode } from "@/lib/body-scan/body-scan-diagnostic-mode";
import { logBodyScanDiagnostic } from "@/lib/body-scan/log-body-scan-diagnostic";
import { fuseBodyScanMeasurements } from "@/lib/body-scan/fuse-measurements";
import { saveBodyProfile } from "@/lib/body-scan/body-profile-storage";
import { useAvatarCalibration } from "@/hooks/use-avatar-calibration";
import { useBodyProfile } from "@/hooks/use-body-profile";
import { saveMeasurementsFromCalibration } from "@/services/measurements.service";
import type { BodyScanSession } from "@/types/body-scan";
import type { AvatarGender } from "@/types/virtual-fitting";
import { cn } from "@/lib/utils";

type Props = {
  session: BodyScanSession;
};

const GENDERS: { value: AvatarGender; label: string }[] = [
  { value: "male", label: "Hombre" },
  { value: "female", label: "Mujer" },
];

export function BodyScanApplyPanel({ session }: Props) {
  const router = useRouter();
  const auth = useOptionalAuth();
  const { profile } = useBodyProfile();
  const { apply } = useAvatarCalibration();
  const [gender, setGender] = useState<AvatarGender>("male");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fused = fuseBodyScanMeasurements(session, profile);
  const canApply = Boolean(fused) && fused!.poseQuality >= 0.4;

  async function handleApply() {
    if (!fused) return;
    setSaving(true);
    setMessage(null);
    try {
      saveBodyProfile({
        heightCm: fused.heightCm,
        weightKg: profile.weightKg,
        updatedAt: new Date().toISOString(),
      });

      const calibration = buildAvatarCalibration(fused, profile, {
        gender,
        sessionId: session.id,
        source: "body_scan",
        hasSideView: session.side?.pose?.status === "ready",
      });

      if (isBodyScanDiagnosticMode()) {
        const report = buildBodyScanDiagnosticReport(session, profile);
        if (report) logBodyScanDiagnostic(report, session);
      }

      saveAvatarCalibration(calibration);
      apply(calibration);

      const tieneSesion =
        Boolean(auth?.usuario) ||
        (await authService.obtenerPerfil().catch(() => null)) !== null;

      if (tieneSesion) {
        try {
          await saveMeasurementsFromCalibration(calibration);
          setMessage("Medidas guardadas en tu cuenta y aplicadas al probador 3D.");
        } catch {
          setMessage(
            "Calibración aplicada localmente. No se pudo sincronizar con el servidor.",
          );
        }
      } else {
        setMessage("Calibración aplicada. Inicia sesión para guardar en el servidor.");
      }

      router.push("/try-on#avatar");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error al aplicar calibración");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassPanel className="space-y-4 p-5 sm:p-6">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
          <Box className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Aplicar al avatar 3D
          </p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Escala altura, ancho de hombros y profundidad de torso en el probador virtual.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {GENDERS.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => setGender(g.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              gender === g.value
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/60",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <Button
        type="button"
        className="w-full rounded-full sm:w-auto"
        disabled={!canApply || saving}
        onClick={() => void handleApply()}
      >
        {saving ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Aplicando…
          </>
        ) : (
          "Aplicar a probador 3D"
        )}
      </Button>

      {message && (
        <p className="text-sm text-emerald-800 dark:text-emerald-200">{message}</p>
      )}
      {!canApply && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Completa ambas capturas con pose válida antes de aplicar.
        </p>
      )}
    </GlassPanel>
  );
}
