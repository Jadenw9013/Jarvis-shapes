"use client";

import dynamic from "next/dynamic";
import type { JarvisVisualMode } from "./useJarvisVisualState";
import type { SceneDescriptor } from "@/lib/scene/sceneStore";

const JarvisSceneClient = dynamic(() => import("./JarvisSceneClient"), {
  ssr: false,
});

interface JarvisVisualPanelProps {
  stateRef: React.RefObject<JarvisVisualMode>;
  objectRef: React.RefObject<SceneDescriptor>;
  currentObject: SceneDescriptor;
}

export function JarvisVisualPanel({
  stateRef,
  objectRef,
  currentObject,
}: JarvisVisualPanelProps) {
  return (
    <div className="jarvis-visual-panel h-full w-full relative overflow-hidden">
      {/* Left edge border */}
      <div className="absolute inset-y-0 left-0 w-px bg-jarvis-border z-10" />

      {/* CSS overlays */}
      <div className="jarvis-scanlines absolute inset-0 pointer-events-none z-10" />
      <div className="jarvis-grid absolute inset-0 pointer-events-none z-10" />
      <div className="jarvis-edge-glow absolute inset-0 pointer-events-none z-10" />

      {/* Object label */}
      {currentObject.generator !== "avatar" && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.3em] text-jarvis-accent/50 font-medium">
            {currentObject.type}
          </span>
        </div>
      )}

      {/* 3D Canvas — client-only, no SSR, no React state props */}
      <JarvisSceneClient stateRef={stateRef} objectRef={objectRef} />
    </div>
  );
}
