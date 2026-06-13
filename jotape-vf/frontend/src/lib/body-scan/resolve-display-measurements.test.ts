import { resolveBodyScanMeasurements } from "@/lib/body-scan/resolve-display-measurements";
import type { BodyScanSession } from "@/types/body-scan";
import type { BodyProfile } from "@/types/body-profile";

const profile: BodyProfile = {
  heightCm: 170,
  weightKg: 70,
  updatedAt: new Date().toISOString(),
};

function sessionWithBadRaw(): BodyScanSession {
  const m = {
    shoulderWidthCm: 32,
    hipWidthCm: 19,
    waistEstimateCm: 5,
    heightEstimateCm: 172,
    poseQuality: 0.85,
  };
  return {
    id: "t",
    status: "complete",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    front: {
      view: "front",
      dataUrl: "x",
      width: 100,
      height: 200,
      mimeType: "image/jpeg",
      source: "camera",
      capturedAt: new Date().toISOString(),
      pose: { status: "ready", measurements: m },
    },
    side: {
      view: "side",
      dataUrl: "y",
      width: 100,
      height: 200,
      mimeType: "image/jpeg",
      source: "camera",
      capturedAt: new Date().toISOString(),
      pose: {
        status: "ready",
        measurements: { ...m, shoulderWidthCm: 18, hipWidthCm: 15, waistEstimateCm: 4 },
      },
    },
  };
}

describe("resolveBodyScanMeasurements", () => {
  it("human panel never shows impossible waist cm from raw fusion", () => {
    const r = resolveBodyScanMeasurements(sessionWithBadRaw(), profile);
    expect(r.human?.waistCm).toBeGreaterThanOrEqual(45);
    expect(r.human?.chestCm).toBeGreaterThanOrEqual(50);
    expect(r.human?.hipCm).toBeGreaterThanOrEqual(50);
  });

  it("exposes technical readout separately from human", () => {
    const r = resolveBodyScanMeasurements(sessionWithBadRaw(), profile);
    expect(r.technical?.poseQualityPercent).toBeGreaterThan(0);
    expect(r.technical?.front).toBeDefined();
    expect(r.technical?.side?.depthRel).toBeDefined();
  });
});
