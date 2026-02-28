"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { JarvisAvatar } from "./JarvisAvatar";
import { GeometryBuilder } from "./GeometryBuilder";
import { JarvisEffects } from "./JarvisEffects";
import type { JarvisVisualMode } from "./useJarvisVisualState";
import type { SceneDescriptor } from "@/lib/scene/sceneStore";

interface JarvisSceneProps {
  stateRef: React.RefObject<JarvisVisualMode>;
  objectRef: React.RefObject<SceneDescriptor>;
}

export function JarvisScene({ stateRef, objectRef }: JarvisSceneProps) {
  const avatarGroupRef = useRef<THREE.Group>(null);
  const objectGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const isAvatar = (objectRef.current?.generator ?? "avatar") === "avatar";
    if (avatarGroupRef.current) avatarGroupRef.current.visible = isAvatar;
    if (objectGroupRef.current) objectGroupRef.current.visible = !isAvatar;
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.08} />
      <pointLight position={[3, 4, 2]} intensity={0.3} color="#00b4d8" />
      <pointLight position={[-3, -1, -3]} intensity={0.15} color="#0077b6" />
      <pointLight position={[0, -3, 2]} intensity={0.08} color="#004e6a" />

      {/* Both always mounted — visibility toggled via ref */}
      <group ref={avatarGroupRef}>
        <JarvisAvatar stateRef={stateRef} />
      </group>
      <group ref={objectGroupRef} visible={false}>
        <GeometryBuilder descriptorRef={objectRef} stateRef={stateRef} />
      </group>

      {/* Post-processing (memoized — never re-renders from parent) */}
      <JarvisEffects stateRef={stateRef} />
    </>
  );
}
