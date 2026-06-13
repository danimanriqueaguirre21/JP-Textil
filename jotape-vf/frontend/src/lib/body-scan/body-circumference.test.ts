import {
  computeCorrectedCircumference,
  ellipseCircumferenceRawCm,
  estimateCircumferenceFromBMI,
} from "@/lib/body-scan/body-circumference";

describe("body-circumference", () => {
  it("uses ellipse formula (not ancho frontal directo)", () => {
    const frontWidthCm = 50;
    const sideDepthCm = 30;
    const raw = ellipseCircumferenceRawCm(frontWidthCm, sideDepthCm);
    const wrongDirect = frontWidthCm;

    expect(raw).toBeGreaterThan(wrongDirect);
    expect(raw).toBeLessThan(frontWidthCm * 3);
    expect(raw).toBeCloseTo(129.5, 0);
  });

  it("corrects inflated waist for 160cm 100kg toward plausible range", () => {
    const result = computeCorrectedCircumference({
      zone: "waist",
      frontWidthCm: 95,
      sideDepthCm: 52,
      heightCm: 160,
      weightKg: 100,
      shoulderWidthCm: 50,
      hipFrontWidthCm: 90,
    });

    expect(result.circumferenceCorrectedCm).toBeGreaterThanOrEqual(100);
    expect(result.circumferenceCorrectedCm).toBeLessThanOrEqual(135);
    expect(result.correctionFactor).toBe(0.75);
    expect(result.frontWidthCm).toBeLessThan(95);
  });

  it("simulates old bug: ancho frontal usado como circunferencia (~228cm)", () => {
    const inflatedFrontWidth = 111;
    const oldWrongWaistCm = 228;
    const result = computeCorrectedCircumference({
      zone: "waist",
      frontWidthCm: inflatedFrontWidth,
      sideDepthCm: 51.8,
      heightCm: 160,
      weightKg: 100,
      shoulderWidthCm: 50,
      hipFrontWidthCm: 95,
    });

    expect(result.circumferenceCorrectedCm).toBeLessThan(160);
    expect(result.circumferenceCorrectedCm).toBeGreaterThanOrEqual(100);
    expect(result.circumferenceCorrectedCm).toBeLessThan(oldWrongWaistCm);
  });

  it("marks suspicious and blends when raw exceeds anatomical max", () => {
    const result = computeCorrectedCircumference({
      zone: "waist",
      frontWidthCm: 130,
      sideDepthCm: 60,
      heightCm: 160,
      weightKg: 100,
    });
    expect(result.suspiciousMeasurement || result.bmiAdjusted).toBe(true);
    expect(result.circumferenceCorrectedCm).toBeLessThanOrEqual(160);
  });

  it("BMI estimate for obese user in expected waist band", () => {
    const w = estimateCircumferenceFromBMI("waist", 160, 100);
    expect(w).toBeGreaterThanOrEqual(100);
    expect(w).toBeLessThanOrEqual(130);
  });
});
