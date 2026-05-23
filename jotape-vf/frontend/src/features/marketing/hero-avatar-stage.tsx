"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

import { AvatarView } from "@/components/virtual-fitting/3d/avatar-view";
import { FITTING_VIEW } from "@/components/virtual-fitting/3d/avatar-camera-fit";
import { FittingLights } from "@/components/virtual-fitting/3d/gltf-avatar";

function HeroScene() {
  return (
    <>
      <color attach="background" args={["#f4f4f5"]} />
      <FittingLights />
      <Suspense fallback={null}>
        <AvatarView gender="male" heightScale={1} showGarment={false} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.65}
        minDistance={3.5}
        maxDistance={5}
        target={[0, 0.93, 0]}
        maxPolarAngle={Math.PI / 2 + 0.12}
      />
    </>
  );
}

export function HeroAvatarStage() {
  return (
    <div className="relative h-full min-h-[20rem] w-full sm:min-h-[24rem] lg:min-h-[28rem]">
      <div
        className="pointer-events-none absolute -left-6 top-8 h-40 w-40 rounded-full bg-zinc-200/70 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-4 bottom-6 h-52 w-52 rounded-full bg-zinc-300/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-200/60 bg-gradient-to-b from-white to-zinc-100/80"
        aria-hidden
      />

      <Canvas
        className="relative z-10 touch-none"
        dpr={[1, 1.5]}
        camera={{
          fov: FITTING_VIEW.fov,
          position: [0, 0.93, 4.1],
          near: 0.1,
          far: 50,
        }}
        gl={{ antialias: true, alpha: false }}
      >
        <HeroScene />
      </Canvas>
    </div>
  );
}
