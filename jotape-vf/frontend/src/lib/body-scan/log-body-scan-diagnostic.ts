import type { BodyScanDiagnosticReport } from "@/types/body-scan-diagnostic";

import { computeBMI } from "@/lib/body-scan/classify-body-type";



function scaleTable(scales: BodyScanDiagnosticReport["scales"]) {

  return {

    shoulderScaleX: scales.shoulderScaleX,

    chestScaleX: scales.chestScaleX,

    waistScaleX: scales.waistScaleX,

    hipScaleX: scales.hipScaleX,

    armScaleX: scales.armScaleX,

    thighScaleX: scales.thighScaleX,

    bodyDepthZ: scales.bodyDepthZ,

    chestDepthZ: scales.chestDepthZ,

    abdomenDepthZ: scales.abdomenDepthZ,

    torsoScaleY: scales.torsoScaleY,

    legScaleY: scales.legScaleY,

  };

}



export function logBodyScanDiagnostic(

  report: BodyScanDiagnosticReport,

  session?: import("@/types/body-scan").BodyScanSession,

): void {

  if (typeof window === "undefined") return;



  const {

    user,

    detected,

    classification,

    scales,

    rawScales,

    visualPreset,

    measuredClamped,

    final,

  } = report;

  const bmi =

    user.peso_kg > 0 && user.altura_cm > 0

      ? computeBMI(user.peso_kg, user.altura_cm)

      : null;



  console.log("\n=== DATOS DEL USUARIO ===");

  console.table({

    altura_cm: user.altura_cm,

    peso_kg: user.peso_kg,

    BMI: bmi ?? "—",

    pixelHeight: user.pixelHeight ?? "—",

    cmPerPixel: user.cmPerPixel?.toFixed(4) ?? "—",

  });



  if (session) {

    for (const view of ["front", "side"] as const) {

      const dbg = session[view]?.pose?.segmentation?.debug;

      if (dbg) {

        console.log(`\n=== MÁSCARA ${view.toUpperCase()} (${dbg.maskSource}) ===`);

        console.table({

          maskWidth: dbg.maskWidth,

          maskHeight: dbg.maskHeight,

          bodyPixelArea: dbg.bodyPixelArea,

          waistPixels: dbg.waistPixels,

          chestPixels: dbg.chestPixels,

          hipPixels: dbg.hipPixels,

          shoulderPixels: dbg.shoulderPixels,

          maskPixelMax: dbg.maskPixelMax.toFixed(3),

        });

      } else {

        console.warn(`[mask/${view}] sin segmentación en sesión — re-captura la foto`);

      }

    }

  }



  console.log("\n=== MEDIDAS DETECTADAS ===");

  console.table({

    ancho_hombros_cm: detected.ancho_hombros_cm,

    pecho_estimado_cm: detected.pecho_estimado_cm,

    cintura_estimada_cm: detected.cintura_estimada_cm,

    cadera_estimada_cm: detected.cadera_estimada_cm,

    profundidad_pecho_cm: detected.profundidad_pecho_cm,

    profundidad_abdomen_cm: detected.profundidad_abdomen_cm,

    profundidad_cadera_cm: detected.profundidad_cadera_cm,

  });



  console.log("\n=== CLASIFICACIÓN ===");

  console.table({

    BMI: bmi ?? report.classification.BMI ?? "—",

    bodyType: classification.bodyType,

    bodyFatEstimate: classification.bodyFatEstimate,

    visualPreset: report.presetKey ?? classification.bodyType,

    blendWeight: report.visualBlendWeight ?? "75% preset / 25% medida",

  });



  if (visualPreset) {

    console.log("\n=== PRESET VISUAL (bodyType) ===");

    console.table(scaleTable(visualPreset));

  }



  if (rawScales) {

    console.log("\n=== ESCALAS CRUDAS (desde medidas) ===");

    console.table(scaleTable(rawScales));

  }



  if (measuredClamped) {

    console.log("\n=== MEDIDAS CLAMPADAS (antes de mezclar) ===");

    console.table(scaleTable(measuredClamped));

  }



  console.log("\n=== ESCALAS FINALES → avatar CC ===");

  console.table(scaleTable(scales));



  if (report.scaleBoneMap) {

    console.log("\n=== HUESOS AFECTADOS POR ESCALA ===");

    console.table(report.scaleBoneMap);

  }



  console.log("\n=== RESULTADO FINAL ===");

  console.table(final);

  console.info(

    "[body-scan] 75% preset visual + 25% medida clampada · sin escalas crudas al rig",

  );

}

