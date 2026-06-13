"use client";

import { HumanMeasurementsPanel } from "@/components/body-scan/human-measurements-panel";
import { PoseTechnicalPanel } from "@/components/body-scan/pose-technical-panel";
import { BodyScanDiagnosticPanel } from "@/components/body-scan/body-scan-diagnostic-panel";
import { GlassPanel } from "@/components/try-on/try-on-ui";
import { resolveBodyScanMeasurements } from "@/lib/body-scan/resolve-display-measurements";
import { useBodyProfile } from "@/hooks/use-body-profile";
import type { BodyScanSession } from "@/types/body-scan";

type Props = {
  session: BodyScanSession;
};

export function BodyScanMeasurementsSummary({ session }: Props) {
  const { profile } = useBodyProfile();
  const resolved = resolveBodyScanMeasurements(session, profile);
  const frontOk = session.front?.pose?.status === "ready";
  const sideOk = session.side?.pose?.status === "ready";

  return (
    <GlassPanel className="space-y-4 p-5 sm:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-600/90 dark:text-violet-400">
          Medidas para el probador
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Estimación a partir del escaneo y tu altura de perfil ({profile.heightCm}{" "}
          cm). Coinciden con el badge «Avatar calibrado» en /try-on.
        </p>
      </div>

      <HumanMeasurementsPanel human={resolved.human} />
      <BodyScanDiagnosticPanel session={session} />
      <PoseTechnicalPanel technical={resolved.technical} />

      <ul className="flex flex-wrap gap-2 text-[11px] text-zinc-500">
        <li
          className={
            frontOk
              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
              : "rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800"
          }
        >
          Frontal {frontOk ? "✓" : "—"}
        </li>
        <li
          className={
            sideOk
              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
              : "rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800"
          }
        >
          Lateral {sideOk ? "✓" : "—"}
        </li>
      </ul>
    </GlassPanel>
  );
}
