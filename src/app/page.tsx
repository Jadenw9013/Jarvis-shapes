"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MobileViewToggle } from "@/components/MobileViewToggle";
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
  const [mobileTab, setMobileTab] = useState<"chat" | "visual">("chat");

  return (
    <main className="h-[100dvh] w-screen bg-jarvis-bg flex flex-col md:flex-row overflow-hidden">
      {/* Header — always visible */}
      <div className="flex flex-col shrink-0 md:hidden">
        <header className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-jarvis-accent animate-pulse-glow" />
            <h1 className="text-lg font-medium tracking-widest uppercase text-jarvis-text-dim">
              Jarvis
            </h1>
          </div>
          <MobileViewToggle activeTab={mobileTab} onTabChange={setMobileTab} />
        </header>
      </div>

      {/* ---- MOBILE: Chat panel ---- */}
      <div
        className={`
          flex-1 min-h-0 flex flex-col
          md:hidden
          ${mobileTab === "chat" ? "flex" : "hidden"}
        `}
      >
        <ChatWindow
          visualControl={jarvisVisual}
          onSceneCommand={scene.setSceneObject}
        />
      </div>

      {/* ---- MOBILE: Visual panel ---- */}
      <div
        className={`
          flex-1 min-h-0
          md:hidden
          ${mobileTab === "visual" ? "block" : "hidden"}
        `}
      >
        <JarvisVisualPanel
          stateRef={jarvisVisual.ref}
          objectRef={scene.objectRef}
          currentObject={scene.currentObject}
        />
      </div>

      {/* ---- DESKTOP: Chat (left column) ---- */}
      <div className="hidden md:flex flex-1 min-w-0 flex-col">
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

      {/* ---- DESKTOP: Visual (right column) ---- */}
      <div className="hidden md:block w-[40%] shrink-0 h-full">
        <JarvisVisualPanel
          stateRef={jarvisVisual.ref}
          objectRef={scene.objectRef}
          currentObject={scene.currentObject}
        />
      </div>
    </main>
  );
}
