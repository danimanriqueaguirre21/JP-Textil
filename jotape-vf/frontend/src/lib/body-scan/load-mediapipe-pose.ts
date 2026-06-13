/**
 * Carga MediaPipe Pose en el navegador.
 * El bundle UMD expone `Pose` en globalThis, no siempre como export nombrado ESM.
 */

export type MediaPipePoseInstance = {
  send: (input: { image: HTMLCanvasElement }) => Promise<void>;
  close: () => void;
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (
    cb: (results: {
      poseLandmarks?: unknown[];
      segmentationMask?: CanvasImageSource;
    }) => void,
  ) => void;
  initialize: () => Promise<void>;
};

type PoseConstructor = new (config: {
  locateFile: (file: string) => string;
}) => MediaPipePoseInstance;

function resolvePoseConstructor(): PoseConstructor {
  const fromGlobal = (globalThis as { Pose?: PoseConstructor }).Pose;
  if (fromGlobal && typeof fromGlobal === "function") {
    return fromGlobal;
  }

  throw new Error(
    "MediaPipe Pose no se cargó. Recarga la página o comprueba tu conexión.",
  );
}

export async function createMediaPipePose(): Promise<MediaPipePoseInstance> {
  const mod = await import("@mediapipe/pose");
  const modPose = (mod as { Pose?: PoseConstructor }).Pose;
  const PoseCtor =
    typeof modPose === "function" ? modPose : resolvePoseConstructor();

  const pose = new PoseCtor({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: false,
    enableSegmentation: true,
    staticImageMode: true,
    minDetectionConfidence: 0.4,
    minTrackingConfidence: 0.4,
  });

  await pose.initialize();
  return pose;
}
