"use client";

import { OrbitControls, Html } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect, useState } from "react";
import { Color } from "three";

import { AvatarView } from "@/components/virtual-fitting/3d/avatar-view";
import { FittingLights } from "@/components/virtual-fitting/3d/gltf-avatar";
import PoloShirt from "@/components/virtual-fitting/3d/polo-shirt";
import Shorts from "@/components/virtual-fitting/3d/shorts";
import type { Size } from "@/lib/sizing/recommender";
import {
  garmentScaleForSize,
  mannequinScaleForHeight,
} from "@/lib/virtual-fitting/size-3d";
import type { AvatarGender } from "@/types/virtual-fitting";

const BACKGROUND = 0xeeeeee;
const FLOOR_COLOR = 0xcccccc;

function SceneRendererSetup() {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    scene.background = new Color(BACKGROUND);
    scene.fog = null;
    gl.setPixelRatio(
      typeof window !== "undefined" ? window.devicePixelRatio : 1,
    );
  }, [gl, scene]);
  return null;
}

function FittingFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial
        color={FLOOR_COLOR}
        roughness={0.92}
        metalness={0}
      />
    </mesh>
  );
}

// Botón flotante para probar
function OutfitToggle({ onToggle, visible }: { onToggle: () => void; visible: boolean }) {
  return (
    <Html position={[0, 2.2, 0]} center>
      <button
        onClick={onToggle}
        style={{
          padding: '10px 24px',
          background: visible ? '#1a1a1a' : '#fff',
          color: visible ? '#fff' : '#1a1a1a',
          border: '2px solid #1a1a1a',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
          whiteSpace: 'nowrap'
        }}
      >
        {visible ? 'Quitar Ropa' : 'Vestir'}
      </button>
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
  const [outfitVisible, setOutfitVisible] = useState(false);
  const heightScale = mannequinScaleForHeight(heightCm);
  const garmentScale = garmentScaleForSize(size);

  return (
    <div className={className ?? "h-full w-full"} style={{ position: 'relative' }}>
      <Canvas
        shadows
        camera={{ fov: 28, position: [0, 1.35, 3.1], near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl, scene }) => {
          scene.background = new Color(BACKGROUND);
          scene.fog = null;
          if (typeof window !== "undefined") {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          }
        }}
      >
        <SceneRendererSetup />
        <FittingLights />
        
        {/* Maniquí con su escala */}
        <group scale={heightScale}>
          <AvatarView
            gender={gender}
            heightScale={1} // ya aplicado en el group padre
            garmentScale={garmentScale}
          />
          
          {/* ROPA - posición y escala ajustadas */}
          <group 
            scale={garmentScale} 
            position={[0, 0, 0]}
          >
            <PoloShirt visible={outfitVisible} />
            <Shorts visible={outfitVisible} />
          </group>
        </group>

        <FittingFloor />
        
        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={5}
          target={[0, 0.95, 0]}
          maxPolarAngle={Math.PI / 2 + 0.15}
        />

        <OutfitToggle 
          visible={outfitVisible} 
          onToggle={() => setOutfitVisible(!outfitVisible)} 
        />
      </Canvas>
    </div>
  );
}