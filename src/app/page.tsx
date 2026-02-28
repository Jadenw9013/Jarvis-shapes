"use client";

import dynamic from "next/dynamic";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useJarvisVisualState } from "@/components/jarvis-visual/useJarvisVisualState";
import { useSceneStore } from "@/lib/scene/sceneStore";

const JarvisVisualPanel = dynamic(
  () =>
    import("@/components/jarvis-visual/JarvisVisualPanel").then(
      (mod) => mod.JarvisVisualPanel
    ),
  { ssr: false }
);

export default function Home() {
  const jarvisVisual = useJarvisVisualState();
  const scene = useSceneStore();

  return (
    <main className="h-screen w-screen bg-jarvis-bg flex overflow-hidden">
      {/* Left — Chat */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-center py-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-jarvis-accent animate-pulse-glow" />
            <h1 className="text-lg font-medium tracking-widest uppercase text-jarvis-text-dim">
              Jarvis
            </h1>
          </div>
        </header>

        <ChatWindow
          visualControl={jarvisVisual}
          onSceneCommand={scene.setSceneObject}
        />
      </div>

      {/* Right — Jarvis 3D Visual */}
      <div className="hidden lg:block w-[40%] shrink-0 h-screen">
        <JarvisVisualPanel
          stateRef={jarvisVisual.ref}
          objectRef={scene.objectRef}
          currentObject={scene.currentObject}
        />
      </div>
    </main>
  );
}
