/**
 * Scene store — mutable ref-based state for the 3D scene descriptor.
 *
 * State is ALWAYS JSON-serializable. Only primitive values, plain
 * objects, arrays of numbers. Never Three.js instances.
 */

import { useRef, useState, useCallback, useMemo } from "react";

// ---------------------------------------------------------------------------
// Scene descriptor — the ONLY shape data that enters React state
// ---------------------------------------------------------------------------

export interface SceneDescriptor {
  generator: "avatar" | "primitive" | "polygon_extrude";
  type: string;
  points?: number[][];
  depth?: number;
}

export const AVATAR_DESCRIPTOR: SceneDescriptor = {
  generator: "avatar",
  type: "avatar",
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export interface SceneControl {
  setSceneObject: (desc: SceneDescriptor) => void;
  objectRef: React.MutableRefObject<SceneDescriptor>;
  currentObject: SceneDescriptor;
}

export function useSceneStore(): SceneControl {
  const objectRef = useRef<SceneDescriptor>(AVATAR_DESCRIPTOR);
  const [currentObject, setCurrentObject] =
    useState<SceneDescriptor>(AVATAR_DESCRIPTOR);

  const setSceneObject = useCallback((desc: SceneDescriptor) => {
    if (process.env.NODE_ENV === "development") {
      if (
        typeof desc !== "object" ||
        desc === null ||
        !("generator" in desc) ||
        !("type" in desc)
      ) {
        console.error(
          "[sceneStore] Invalid descriptor — must have generator and type.",
          desc
        );
        return;
      }
      if ("isObject3D" in desc) {
        console.error(
          "[sceneStore] Three.js object detected in state — only plain descriptors allowed."
        );
        return;
      }
    }
    objectRef.current = desc;
    setCurrentObject(desc);
  }, []);

  return useMemo(
    () => ({ setSceneObject, objectRef, currentObject }),
    [setSceneObject, currentObject]
  );
}
