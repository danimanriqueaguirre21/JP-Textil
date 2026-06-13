"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Group } from "three";

import { AvatarModelErrorBoundary } from "@/components/virtual-fitting/3d/avatar-model-error-boundary";
import { AvatarHeightDebug } from "@/components/virtual-fitting/3d/avatar-height-debug";
import { AvatarView } from "@/components/virtual-fitting/3d/avatar-view";
import { FITTING_VIEW } from "@/components/virtual-fitting/3d/avatar-camera-fit";
import { FittingLights } from "@/components/virtual-fitting/3d/gltf-avatar";
import type { Size } from "@/lib/sizing/recommender";
import {
  garmentScaleForSize,
  mannequinScaleForHeight,
} from "@/lib/virtual-fitting/size-3d";
import type { AvatarCalibration } from "@/types/avatar-calibration";
import type { AvatarGender } from "@/types/virtual-fitting";

function SceneRendererSetup() {
  const { gl, scene } = useThree();

  useLayoutEffect(() => {
    scene.background = null;
    scene.fog = null;
    gl.setClearColor(0x000000, 0);
    gl.setPixelRatio(
      typeof window !== "undefined" ? window.devicePixelRatio : 1,
    );
  }, [gl, scene]);

  return null;
}

/** Respiración idle muy sutil. */
function AvatarIdleWrapper({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = Math.sin(t * 0.9) * 0.012;
    const breath = 1 + Math.sin(t * 1.1) * 0.005;
    ref.current.scale.setScalar(breath);
  });

  return <group ref={ref}>{children}</group>;
}

function FittingPlatform() {
  return (
    <group position={[0, 0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.35, 64]} />
        <meshStandardMaterial
          color="#f4f4f5"
          roughness={0.35}
          metalness={0.08}
          emissive="#ffffff"
          emissiveIntensity={0.12}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <ringGeometry args={[1.35, 1.55, 64]} />
        <meshStandardMaterial
          color="#e9d5ff"
          transparent
          opacity={0.35}
          roughness={0.9}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]}>
        <circleGeometry args={[2.2, 64]} />
        <meshStandardMaterial
          color="#ddd6fe"
          transparent
          opacity={0.08}
          roughness={1}
        />
      </mesh>
    </group>
  );
}

function AvatarLoading() {
  return (
    <Html center>
      <p className="rounded-2xl border border-white/60 bg-white/90 px-4 py-2 text-sm text-zinc-600 shadow-lg backdrop-blur">
        Cargando avatar 3D…
      </p>
    </Html>
  );
}

type Props = {
  gender: AvatarGender;
  size?: Size;
  heightCm?: number;
  heightScale?: number;
  widthScale?: number;
  depthScale?: number;
  zoneScales?: import("@/types/avatar-calibration").AvatarZoneScales;
  avatarCalibration?: AvatarCalibration;
  className?: string;
  showHeightDebug?: boolean;
};

export function FittingScene(props: Props) {
  const [sceneKey, setSceneKey] = useState(0);

  return (
    <AvatarModelErrorBoundary onRetry={() => setSceneKey((k) => k + 1)}>
      <FittingSceneCanvas key={sceneKey} {...props} />
    </AvatarModelErrorBoundary>
  );
}

function FittingSceneCanvas({
  gender,
  size = "M",
  heightCm = 170,
  heightScale: heightScaleProp,
  widthScale = 1,
  depthScale = 1,
  zoneScales,
  avatarCalibration,
  className,
  showHeightDebug = false,
}: Props) {
  const heightScale = heightScaleProp ?? mannequinScaleForHeight(heightCm);
  const proportionsScale = zoneScales
    ? undefined
    : { x: widthScale, z: depthScale };
  const garmentScale = garmentScaleForSize(size);
  const lookAtY = 0.52 + 0.42 * heightScale;

  return (
    <div
      className={
        className ??
        "h-full w-full bg-gradient-to-br from-violet-100/90 via-slate-100 to-sky-100/80 dark:from-violet-950/40 dark:via-zinc-900 dark:to-sky-950/30"
      }
    >
      <Canvas
        camera={{
          fov: FITTING_VIEW.fov,
          position: [0, lookAtY, 4.15],
          near: 0.1,
          far: 50,
        }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, scene }) => {
          scene.background = null;
          scene.fog = null;
          gl.setClearColor(0x000000, 0);
          if (typeof window !== "undefined") {
            gl.setPixelRatio(window.devicePixelRatio);
          }
        }}
      >
        <SceneRendererSetup />
        <FittingLights />
        <pointLight position={[0, 2.2, 1.5]} intensity={0.25} color="#c4b5fd" />
        <pointLight position={[-2, 1.5, 2]} intensity={0.15} color="#93c5fd" />
        <Suspense fallback={<AvatarLoading />}>
          <AvatarIdleWrapper>
            <AvatarView
              gender={gender}
              heightScale={heightScale}
              widthScale={widthScale}
              depthScale={depthScale}
              zoneScales={zoneScales}
              avatarCalibration={avatarCalibration}
              proportionsScale={proportionsScale}
              garmentScale={garmentScale}
            />
          </AvatarIdleWrapper>
        </Suspense>
        <FittingPlatform />
        {showHeightDebug && (
          <AvatarHeightDebug
            gender={gender}
            heightCm={heightCm}
            heightScale={heightScale}
          />
        )}
        <OrbitControls
          enablePan={false}
          minDistance={3.6}
          maxDistance={5.4}
          target={[0, lookAtY, 0]}
          maxPolarAngle={Math.PI / 2 + 0.15}
          autoRotate
          autoRotateSpeed={0.35}
        />
      </Canvas>
    </div>
  );
}
