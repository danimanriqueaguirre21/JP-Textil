"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type UseCameraOptions = {
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
};

export function useCamera(options: UseCameraOptions = {}) {
  const { facingMode = "user", width = 1280, height = 720 } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      setReady(true);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "No se pudo acceder a la cámara";
      setError(msg);
      setReady(false);
    }
  }, [facingMode, height, stop, width]);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, start, stop, ready, error };
}
