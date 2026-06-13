import { fuseBodyScanMeasurements } from "@/lib/body-scan/fuse-measurements";
import type { BodyScanSession } from "@/types/body-scan";
import type { BodyProfile } from "@/types/body-profile";

const profile: BodyProfile = {
  heightCm: 178,
  weightKg: 72,
  updatedAt: new Date().toISOString(),
};

function sessionWith(front: boolean, side: boolean): BodyScanSession {
  const base = {
    id: "test",
    status: "complete" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const m = {
    shoulderWidthCm: 46,
    hipWidthCm: 50,
    waistEstimateCm: 80,
    heightEstimateCm: 172,
    poseQuality: 0.9,
  };
  return {
    ...base,
    front: front
      ? {
          view: "front",
          dataUrl: "x",
          width: 100,
          height: 200,
          mimeType: "image/jpeg",
          source: "camera",
          capturedAt: new Date().toISOString(),
          pose: { status: "ready", measurements: m },
        }
      : undefined,
    side: side
      ? {
          view: "side",
          dataUrl: "y",
          width: 100,
          height: 200,
          mimeType: "image/jpeg",
          source: "camera",
          capturedAt: new Date().toISOString(),
          pose: {
            status: "ready",
            measurements: { ...m, shoulderWidthCm: 20, hipWidthCm: 28 },
          },
        }
      : undefined,
  };
}

describe("fuseBodyScanMeasurements", () => {
  it("uses profile height when set", () => {
    const fused = fuseBodyScanMeasurements(sessionWith(true, true), profile);
    expect(fused?.heightCm).toBe(178);
  });

  it("returns null without valid captures", () => {
    expect(fuseBodyScanMeasurements(sessionWith(false, false), profile)).toBeNull();
  });

  it("includes limb lengths scaled from height when no landmarks", () => {
    const fused = fuseBodyScanMeasurements(sessionWith(true, false), profile);
    expect(fused?.armLengthCm).toBeGreaterThan(50);
    expect(fused?.legLengthCm).toBeGreaterThan(70);
    expect(fused?.torsoLengthCm).toBeGreaterThan(40);
  });
});
