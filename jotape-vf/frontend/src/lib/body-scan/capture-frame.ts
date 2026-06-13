const JPEG_QUALITY = 0.88;
const MAX_EDGE = 1920;

export type CapturedFrame = {
  dataUrl: string;
  width: number;
  height: number;
  mimeType: string;
};

function scaleToMaxEdge(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function canvasToJpeg(
  source: CanvasImageSource,
  sw: number,
  sh: number,
): CapturedFrame | null {
  const target = scaleToMaxEdge(sw, sh, MAX_EDGE);
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, sw, sh, 0, 0, target.width, target.height);
  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  return {
    dataUrl,
    width: target.width,
    height: target.height,
    mimeType: "image/jpeg",
  };
}

/** Captura un frame del stream de vídeo activo. */
export function captureFromVideo(video: HTMLVideoElement): CapturedFrame | null {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;
  return canvasToJpeg(video, w, h);
}

/** Convierte un archivo de imagen subido a JPEG normalizado. */
export async function captureFromFile(file: File): Promise<CapturedFrame> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecciona un archivo de imagen (JPG, PNG o WebP).");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo leer la imagen."));
      el.src = objectUrl;
    });

    const frame = canvasToJpeg(
      img,
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
    );
    if (!frame) throw new Error("No se pudo procesar la imagen.");
    return frame;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
