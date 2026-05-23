"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useRef, type ReactNode } from "react";
import type { Group } from "three";

import { AvatarView } from "@/components/virtual-fitting/3d/avatar-view";
import { FITTING_VIEW } from "@/components/virtual-fitting/3d/avatar-camera-fit";
import { FittingLights } from "@/components/virtual-fitting/3d/gltf-avatar";
import type { Size } from "@/lib/sizing/recommender";
import {
  garmentScaleForSize,
  mannequinScaleForHeight,
} from "@/lib/virtual-fitting/size-3d";
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
  className?: string;
};

export function FittingScene({
  gender,
  size = "M",
  heightCm = 170,
  className,
}: Props) {
  const heightScale = mannequinScaleForHeight(heightCm);
  const garmentScale = garmentScaleForSize(size);

  return (
    <div
      className={
        className ??
        "h-full w-full bg-gradient-to-br from-violet-100/90 via-slate-100 to-sky-100/80 dark:from-violet-950/40 dark:via-zinc-900 dark:to-sky-950/30"
      }
    >
      <Canvas
        camera={{ fov: FITTING_VIEW.fov, position: [0, 0.93, 4.1], near: 0.1, far: 50 }}
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
              garmentScale={garmentScale}
            />
          </AvatarIdleWrapper>
        </Suspense>
        <FittingPlatform />
        <OrbitControls
          enablePan={false}
          minDistance={3.5}
          maxDistance={5.2}
          target={[0, 0.93, 0]}
          maxPolarAngle={Math.PI / 2 + 0.15}
          autoRotate
          autoRotateSpeed={0.35}
        />
      </Canvas>
    </div>
  );
}
