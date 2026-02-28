"use client";

import { Canvas } from "@react-three/fiber";
import { JarvisScene } from "./JarvisScene";
import type { JarvisVisualMode } from "./useJarvisVisualState";
import type { SceneDescriptor } from "@/lib/scene/sceneStore";

interface JarvisSceneClientProps {
  stateRef: React.RefObject<JarvisVisualMode>;
  objectRef: React.RefObject<SceneDescriptor>;
}

export default function JarvisSceneClient({
  stateRef,
  objectRef,
}: JarvisSceneClientProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 3.8], fov: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <JarvisScene stateRef={stateRef} objectRef={objectRef} />
    </Canvas>
  );
}
