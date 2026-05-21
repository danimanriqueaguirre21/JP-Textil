"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PoloShirtProps {
  visible?: boolean;
}

export default function PoloShirt({ visible = true }: PoloShirtProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && visible) {
      groupRef.current.scale.lerp(
        new THREE.Vector3(1, 1, 1),
        0.08
      );
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} scale={[0.001, 0.001, 0.001]}>
      {/* Torso */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.30, 0.55, 16]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Manga izquierda */}
      <mesh position={[-0.42, 0.25, 0]} rotation={[0, 0, 0.4]} castShadow>
        <cylinderGeometry args={[0.12, 0.10, 0.25, 12]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Manga derecha */}
      <mesh position={[0.42, 0.25, 0]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.12, 0.10, 0.25, 12]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Cuello */}
      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.14, 0.025, 8, 16]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Smiley */}
      <group position={[0.12, 0.15, 0.21]} scale={1.5}>
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