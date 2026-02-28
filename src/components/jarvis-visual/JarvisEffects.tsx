"use client";

import React, { useRef } from "react";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import type { JarvisVisualMode } from "./useJarvisVisualState";

interface JarvisEffectsProps {
  stateRef: React.RefObject<JarvisVisualMode>;
}

export const JarvisEffects = React.memo(function JarvisEffects({
  stateRef,
}: JarvisEffectsProps) {
  const intensityRef = useRef(0.5);
  const bloomRef = useRef(null);

  useFrame((_, delta) => {
    const mode = stateRef.current ?? "idle";

    let target: number;
    switch (mode) {
      case "thinking":
        target = 0.85;
        break;
      case "speaking":
        target = 0.7;
        break;
      default:
        target = 0.5;
    }

    intensityRef.current += (target - intensityRef.current) * 2 * delta;

    if (bloomRef.current) {
      (bloomRef.current as unknown as { intensity: number }).intensity =
        intensityRef.current;
    }
  });

  return (
    <EffectComposer>
      <Bloom
        ref={bloomRef as never}
        luminanceThreshold={0}
        luminanceSmoothing={0.8}
        intensity={0.5}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.65} />
    </EffectComposer>
  );
});
