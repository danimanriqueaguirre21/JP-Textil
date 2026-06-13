"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PoseLandmark } from "@/types/virtual-fitting";

type PoseResults = {
  poseLandmarks?: PoseLandmark[];
};

export function useMediaPipePose(enabled: boolean) {
  const [landmarks, setLandmarks] = useState<PoseLandmark[] | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const poseRef = useRef<{
    send: (input: { image: HTMLVideoElement | HTMLCanvasElement }) => Promise<void>;
    close: () => void;
  } | null>(null);
  const cameraRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function init() {
      try {
        const [{ createMediaPipePose }, { Camera }] = await Promise.all([
          import("@/lib/body-scan/load-mediapipe-pose"),
          import("@mediapipe/camera_utils"),
        ]);

        if (cancelled) return;

        const pose = await createMediaPipePose();

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          staticImageMode: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results: PoseResults) => {
          if (results.poseLandmarks?.length) {
            setLandmarks(results.poseLandmarks);
          }
        });

        await pose.initialize();
        poseRef.current = pose;
        setReady(true);
        setError(null);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "MediaPipe no disponible en este navegador",
        );
        setReady(false);
      }
    }

    void init();

    return () => {
      cancelled = true;
      cameraRef.current?.stop();
      cameraRef.current = null;
      poseRef.current?.close();
      poseRef.current = null;
      setReady(false);
    };
  }, [enabled]);

  const attachToVideo = useCallback(
    async (video: HTMLVideoElement | null) => {
      if (!video || !poseRef.current || !ready) return;

      const { Camera } = await import("@mediapipe/camera_utils");
      cameraRef.current?.stop();

      const camera = new Camera(video, {
        onFrame: async () => {
          if (poseRef.current && video.readyState >= 2) {
            await poseRef.current.send({ image: video });
          }
        },
        width: video.videoWidth || 1280,
        height: video.videoHeight || 720,
      });

      cameraRef.current = camera;
      await camera.start();
    },
    [ready],
  );

  const processImage = useCallback(
    async (source: HTMLCanvasElement | HTMLImageElement) => {
      if (!poseRef.current) return;
      if (source instanceof HTMLCanvasElement) {
        await poseRef.current.send({ image: source });
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = source.naturalWidth || source.width;
      canvas.height = source.naturalHeight || source.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(source, 0, 0);
      await poseRef.current.send({ image: canvas });
    },
    [],
  );

  return {
    landmarks,
    ready,
    error,
    attachToVideo,
    processImage,
  };
}
