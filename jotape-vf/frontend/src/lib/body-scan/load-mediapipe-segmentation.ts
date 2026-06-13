/**
 * Carga MediaPipe Selfie Segmentation en el navegador.
 */

export type SegmentationMask = CanvasImageSource;

export type MediaPipeSegmentationInstance = {
  send: (input: { image: HTMLCanvasElement }) => Promise<void>;
  close: () => void;
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (
    cb: (results: { segmentationMask?: SegmentationMask }) => void,
  ) => void;
  initialize: () => Promise<void>;
};

type SelfieSegmentationConstructor = new (config: {
  locateFile: (file: string) => string;
}) => MediaPipeSegmentationInstance;

function resolveConstructor(): SelfieSegmentationConstructor {
  const fromGlobal = (globalThis as { SelfieSegmentation?: SelfieSegmentationConstructor })
    .SelfieSegmentation;
  if (fromGlobal && typeof fromGlobal === "function") return fromGlobal;
  throw new Error(
    "MediaPipe Selfie Segmentation no se cargó. Recarga o comprueba tu conexión.",
  );
}

export async function createMediaPipeSegmentation(): Promise<MediaPipeSegmentationInstance> {
  const mod = await import("@mediapipe/selfie_segmentation");
  const modCtor = (mod as { SelfieSegmentation?: SelfieSegmentationConstructor })
    .SelfieSegmentation;
  const Ctor =
    typeof modCtor === "function" ? modCtor : resolveConstructor();

  const seg = new Ctor({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
  });

  seg.setOptions({
    modelSelection: 0,
    selfieMode: false,
  });

  await seg.initialize();
  return seg;
}
