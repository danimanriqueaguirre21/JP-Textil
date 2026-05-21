"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShortsProps {
  visible?: boolean;
}

export default function Shorts({ visible = true }: ShortsProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && visible) {
      groupRef.current.scale.lerp(
        new THREE.Vector3(1, 1, 1),
        0.06
      );
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} scale={[0.001, 0.001, 0.001]}>
      {/* Cintura */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.31, 0.33, 0.12, 16]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.88} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Pernera izquierda */}
      <mesh position={[-0.16, -0.58, 0]} rotation={[0, 0, 0.05]} castShadow>
        <cylinderGeometry args={[0.155, 0.14, 0.35, 12]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.88} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Pernera derecha */}
      <mesh position={[0.16, -0.58, 0]} rotation={[0, 0, -0.05]} castShadow>
        <cylinderGeometry args={[0.155, 0.14, 0.35, 12]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.88} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Smiley pierna izquierda */}
      <group position={[-0.16, -0.55, 0.16]} scale={1.2}>
        <mesh position={[-0.025, 0.02, 0]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
        <mesh position={[0.025, 0.02, 0]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.04, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}