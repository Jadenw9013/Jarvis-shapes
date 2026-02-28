/**
 * useJarvisVisualState — External state bridge for the 3D visualization.
 *
 * Uses a mutable ref object so the Three.js render loop can read
 * current state every frame WITHOUT triggering React re-renders.
 *
 * Usage in chat:  jarvisVisual.setState("thinking")
 * Usage in scene: const mode = jarvisVisual.getState()
 */

import { useRef, useCallback, useMemo } from "react";

export type JarvisVisualMode = "idle" | "thinking" | "speaking";

export interface JarvisVisualControl {
  /** Set the current visual mode (call from chat logic). */
  setState: (mode: JarvisVisualMode) => void;
  /** Read the current visual mode (call from render loop). */
  getState: () => JarvisVisualMode;
  /** Mutable ref — pass to the visual panel as a prop. */
  ref: React.MutableRefObject<JarvisVisualMode>;
}

export function useJarvisVisualState(): JarvisVisualControl {
  const stateRef = useRef<JarvisVisualMode>("idle");

  const setState = useCallback((mode: JarvisVisualMode) => {
    stateRef.current = mode;
  }, []);

  const getState = useCallback(() => {
    return stateRef.current;
  }, []);

  return useMemo(
    () => ({ setState, getState, ref: stateRef }),
    [setState, getState]
  );
}
