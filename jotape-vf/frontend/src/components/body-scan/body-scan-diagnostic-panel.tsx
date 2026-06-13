"use client";

import { useEffect } from "react";

import { GlassPanel } from "@/components/try-on/try-on-ui";
import { buildBodyScanDiagnosticReport } from "@/lib/body-scan/build-body-scan-diagnostic";
import { computeBMI } from "@/lib/body-scan/classify-body-type";
import { isBodyScanDiagnosticMode } from "@/lib/body-scan/body-scan-diagnostic-mode";
import { logBodyScanDiagnostic } from "@/lib/body-scan/log-body-scan-diagnostic";
import { useBodyProfile } from "@/hooks/use-body-profile";
import type { BodyScanSession } from "@/types/body-scan";

type Props = {
  session: BodyScanSession;
};

export function BodyScanDiagnosticPanel({ session }: Props) {
  const { profile } = useBodyProfile();
  const report = buildBodyScanDiagnosticReport(session, profile);
  const diagnostic = isBodyScanDiagnosticMode();

  useEffect(() => {
    if (report && diagnostic) {
      logBodyScanDiagnostic(report, session);
    }
  }, [report, diagnostic, session]);

  if (!report) {
    return null;
  }

  const {
    user,
    detected,
    classification,
    scales,
    rawScales,
    visualPreset,
    measuredClamped,
    presetKey,
    visualBlendWeight,
    scaleBoneMap,
    final,
    circumference,
  } = report;
  const bmi =
    profile.weightKg > 0 && profile.heightCm > 0
      ? computeBMI(profile.weightKg, profile.heightCm)
      : null;
  const frontMask = session.front?.pose?.segmentation?.debug;
  const sideMask = session.side?.pose?.segmentation?.debug;

  return (
    <GlassPanel className="space-y-5 border-2 border-amber-400/60 p-5 sm:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">
          Modo diagnóstico {diagnostic ? "· ACTIVO" : "· inactivo"}
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Medidas reales sin suavizado. Avatar CC: 75% preset visual + 25% medida clampada.
          Desactivar: <code className="text-xs">NEXT_PUBLIC_BODY_SCAN_DIAGNOSTIC=false</code>
        </p>
      </div>

      <DebugSection title="=== DATOS DEL USUARIO ===">
        <DebugTable
          rows={[
            ["altura_cm", user.altura_cm],
            ["peso_kg", user.peso_kg || "—"],
            ["BMI", bmi ?? "—"],
            ["pixelHeight", user.pixelHeight ?? "—"],
            ["cmPerPixel", user.cmPerPixel?.toFixed(4) ?? "—"],
            ["segmentationUsed", final.segmentationUsed ? "sí" : "NO"],
          ]}
        />
      </DebugSection>

      {(frontMask || sideMask) && (
        <DebugSection title="=== MÁSCARA CORPORAL ===">
          <DebugTable
            rows={[
              ["front maskWidth", frontMask?.maskWidth ?? "—"],
              ["front bodyPixelArea", frontMask?.bodyPixelArea ?? "—"],
              ["front waistPixels", frontMask?.waistPixels ?? "—"],
              ["front chestPixels", frontMask?.chestPixels ?? "—"],
              ["front hipPixels", frontMask?.hipPixels ?? "—"],
              ["side waistPixels", sideMask ? "—" : "—"],
              ["side prof. abdomen px", sideMask?.waistPixels ?? "—"],
              ["maskSource", frontMask?.maskSource ?? sideMask?.maskSource ?? "—"],
            ]}
          />
        </DebugSection>
      )}

      {!final.segmentationUsed && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          Segmentación no utilizada. Las fotos guardadas pueden ser anteriores a esta
          corrección — repite el escaneo frontal y lateral.
        </p>
      )}

      <DebugSection title="=== MEDIDAS CORREGIDAS (→ avatar) ===">
        <DebugTable
          rows={[
            ["ancho_hombros_cm", detected.ancho_hombros_cm],
            ["pecho_estimado_cm", detected.pecho_estimado_cm],
            ["cintura_estimada_cm", detected.cintura_estimada_cm],
            ["cadera_estimada_cm", detected.cadera_estimada_cm],
            ["profundidad_abdomen_cm", detected.profundidad_abdomen_cm],
          ]}
        />
      </DebugSection>

      {circumference?.waist && (
        <DebugSection title="=== CINTURA: silueta → circunferencia ===">
          <DebugTable
            rows={[
              ["waistFrontWidthCm", circumference.waist.frontWidthCm],
              ["waistSideDepthCm", circumference.waist.sideDepthCm],
              ["waistCircumferenceRawCm", circumference.waist.circumferenceRawCm],
              [
                "waistCircumferenceCorrectedCm",
                circumference.waist.circumferenceCorrectedCm,
              ],
              ["correctionFactor", circumference.waist.correctionFactor],
              [
                "suspiciousMeasurement",
                circumference.waist.suspiciousMeasurement ? "true" : "false",
              ],
              ["bmiAdjusted", circumference.waist.bmiAdjusted ? "true" : "false"],
            ]}
          />
        </DebugSection>
      )}

      {(circumference?.chest || circumference?.hip) && (
        <DebugSection title="=== PECHO / CADERA ===">
          <DebugTable
            rows={[
              ...(circumference.chest
                ? ([
                    ["chestFrontWidthCm", circumference.chest.frontWidthCm],
                    ["chestSideDepthCm", circumference.chest.sideDepthCm],
                    ["chestCircumferenceRawCm", circumference.chest.circumferenceRawCm],
                    [
                      "chestCircumferenceCorrectedCm",
                      circumference.chest.circumferenceCorrectedCm,
                    ],
                    [
                      "chestSuspicious",
                      circumference.chest.suspiciousMeasurement ? "true" : "false",
                    ],
                  ] as [string, string | number][])
                : []),
              ...(circumference.hip
                ? ([
                    ["hipFrontWidthCm", circumference.hip.frontWidthCm],
                    ["hipSideDepthCm", circumference.hip.sideDepthCm],
                    ["hipCircumferenceRawCm", circumference.hip.circumferenceRawCm],
                    [
                      "hipCircumferenceCorrectedCm",
                      circumference.hip.circumferenceCorrectedCm,
                    ],
                    [
                      "hipSuspicious",
                      circumference.hip.suspiciousMeasurement ? "true" : "false",
                    ],
                  ] as [string, string | number][])
                : []),
            ]}
          />
        </DebugSection>
      )}

      <DebugSection title="=== MEDIDAS DETECTADAS (resumen) ===">
        <DebugTable
          rows={[
            ["profundidad_pecho_cm", detected.profundidad_pecho_cm],
            ["profundidad_cadera_cm", detected.profundidad_cadera_cm],
          ]}
        />
      </DebugSection>

      <DebugSection title="=== CLASIFICACIÓN ===">
        <DebugTable
          rows={[
            ["BMI", bmi ?? "—"],
            ["bodyType", `${classification.bodyType}`],
            ["bodyFatEstimate", classification.bodyFatEstimate.toFixed(2)],
          ]}
        />
      </DebugSection>

      <DebugSection title="=== PRESET VISUAL (bodyType) ===">
        <DebugTable
          rows={[
            ["presetKey", presetKey ?? classification.bodyType],
            ["blend", visualBlendWeight != null ? `${Math.round((1 - visualBlendWeight) * 100)}% preset + ${Math.round(visualBlendWeight * 100)}% medida` : "75% / 25%"],
          ]}
        />
        {visualPreset ? <ScaleTable scales={visualPreset} /> : null}
      </DebugSection>

      <DebugSection title="=== ESCALAS CRUDAS (desde medidas) ===">
        {rawScales ? (
          <ScaleTable scales={rawScales} />
        ) : (
          <p className="text-xs text-zinc-500">No disponible</p>
        )}
      </DebugSection>

      {measuredClamped && (
        <DebugSection title="=== MEDIDAS CLAMPADAS (antes de mezclar) ===">
          <ScaleTable scales={measuredClamped} />
        </DebugSection>
      )}

      <DebugSection title="=== ESCALAS FINALES → avatar CC ===">
        <ScaleTable scales={scales} />
      </DebugSection>

      {scaleBoneMap && (
        <DebugSection title="=== HUESOS AFECTADOS POR ESCALA ===">
          <DebugTable
            rows={Object.entries(scaleBoneMap).map(([k, v]) => [k, v] as [string, string | number])}
          />
        </DebugSection>
      )}

      <DebugSection title="=== RESULTADO FINAL → avatar ===">
        <div className="overflow-x-auto rounded-lg bg-zinc-950/90 p-3 font-mono text-[11px] text-emerald-300">
          <pre>{JSON.stringify(final, null, 2)}</pre>
        </div>
      </DebugSection>
    </GlassPanel>
  );
}

function ScaleTable({ scales }: { scales: import("@/types/proportional-scales").ProportionalAvatarScales }) {
  return (
    <DebugTable
      rows={[
        ["shoulderScaleX", fmt(scales.shoulderScaleX)],
        ["chestScaleX", fmt(scales.chestScaleX)],
        ["waistScaleX", fmt(scales.waistScaleX)],
        ["hipScaleX", fmt(scales.hipScaleX)],
        ["armScaleX", fmt(scales.armScaleX)],
        ["thighScaleX", fmt(scales.thighScaleX)],
        ["bodyDepthZ", fmt(scales.bodyDepthZ)],
        ["chestDepthZ", fmt(scales.chestDepthZ)],
        ["abdomenDepthZ", fmt(scales.abdomenDepthZ)],
        ["torsoScaleY", fmt(scales.torsoScaleY)],
        ["legScaleY", fmt(scales.legScaleY)],
      ]}
    />
  );
}

function fmt(n: number): string {
  return Number(n.toFixed(4)).toString();
}

function DebugSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold tracking-wide text-zinc-700 dark:text-zinc-300">
        {title}
      </p>
      {children}
    </div>
  );
}

function DebugTable({
  rows,
}: {
  rows: [string, string | number][];
}) {
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {rows.map(([key, val]) => (
          <tr
            key={key}
            className="border-b border-zinc-200/80 dark:border-zinc-700/80"
          >
            <td className="py-1.5 pr-4 font-mono text-xs text-zinc-500">{key}</td>
            <td className="py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
              {val}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
