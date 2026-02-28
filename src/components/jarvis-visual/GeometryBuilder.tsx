"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneDescriptor } from "@/lib/scene/sceneStore";
import type { JarvisVisualMode } from "./useJarvisVisualState";

interface GeometryBuilderProps {
  descriptorRef: React.RefObject<SceneDescriptor>;
  stateRef: React.RefObject<JarvisVisualMode>;
}

// ---------------------------------------------------------------------------
// Primitive geometry lookup
// ---------------------------------------------------------------------------

function buildPrimitiveGeometries() {
  return {
    sphere: new THREE.SphereGeometry(1.2, 24, 24),
    cube: new THREE.BoxGeometry(1.8, 1.8, 1.8, 4, 4, 4),
    pyramid: new THREE.ConeGeometry(1.3, 2, 4, 1),
    torus: new THREE.TorusGeometry(1, 0.4, 16, 48),
    cylinder: new THREE.CylinderGeometry(0.9, 0.9, 2, 16, 4),
    // Inner (smaller core glow)
    sphereInner: new THREE.SphereGeometry(0.7, 12, 12),
    cubeInner: new THREE.BoxGeometry(1.1, 1.1, 1.1, 2, 2, 2),
    pyramidInner: new THREE.ConeGeometry(0.8, 1.3, 4, 1),
    torusInner: new THREE.TorusGeometry(0.7, 0.2, 8, 24),
    cylinderInner: new THREE.CylinderGeometry(0.5, 0.5, 1.3, 8, 2),
  };
}

// ---------------------------------------------------------------------------
// Polygon extrude geometry builder
// ---------------------------------------------------------------------------

function buildExtrudeGeometry(
  points: number[][],
  depth: number
): { outer: THREE.BufferGeometry; inner: THREE.BufferGeometry } {
  const shape = new THREE.Shape();

  if (points.length < 3) {
    // Fallback to unit triangle
    shape.moveTo(0, 1);
    shape.lineTo(1, -1);
    shape.lineTo(-1, -1);
    shape.closePath();
  } else {
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i][0], points[i][1]);
    }
    shape.closePath();
  }

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 1,
  };

  const outer = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Center the geometry
  outer.computeBoundingBox();
  outer.center();

  // Inner — same shape, smaller
  const innerScale = 0.6;
  const innerShape = new THREE.Shape();
  if (points.length >= 3) {
    innerShape.moveTo(points[0][0] * innerScale, points[0][1] * innerScale);
    for (let i = 1; i < points.length; i++) {
      innerShape.lineTo(points[i][0] * innerScale, points[i][1] * innerScale);
    }
    innerShape.closePath();
  }

  const inner = new THREE.ExtrudeGeometry(innerShape, {
    ...extrudeSettings,
    depth: depth * 0.6,
  });
  inner.center();

  return { outer, inner };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GeometryBuilder({
  descriptorRef,
  stateRef,
}: GeometryBuilderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);
  const innerMeshRef = useRef<THREE.Mesh>(null);
  const elapsedRef = useRef(0);
  const currentScaleRef = useRef(0.01);
  const prevDescKeyRef = useRef("");
  const customGeoRef = useRef<{
    outer: THREE.BufferGeometry;
    inner: THREE.BufferGeometry;
  } | null>(null);

  const primitives = useMemo(() => buildPrimitiveGeometries(), []);

  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#00b4d8"),
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      }),
    []
  );

  const coreMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#00d4ff"),
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current || !outerMeshRef.current || !innerMeshRef.current)
      return;

    const desc = descriptorRef.current;
    const mode = stateRef.current ?? "idle";
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    // -- Detect descriptor change → scale-in animation --
    const descKey = desc.generator + ":" + desc.type;
    if (descKey !== prevDescKeyRef.current) {
      currentScaleRef.current = 0.01;
      prevDescKeyRef.current = descKey;

      // Build custom geometry if needed
      if (desc.generator === "polygon_extrude" && desc.points) {
        // Dispose old custom geometry
        if (customGeoRef.current) {
          customGeoRef.current.outer.dispose();
          customGeoRef.current.inner.dispose();
        }
        customGeoRef.current = buildExtrudeGeometry(
          desc.points,
          desc.depth ?? 0.5
        );
      }
    }

    // -- Scale-in transition --
    currentScaleRef.current +=
      (1 - currentScaleRef.current) * 3 * delta;
    const s = currentScaleRef.current;
    groupRef.current.scale.set(s, s, s);

    // -- Rotation --
    const rotSpeed = mode === "thinking" ? 0.42 : 0.3;
    groupRef.current.rotation.y += delta * rotSpeed;

    // -- Floating --
    const floatAmp = mode === "speaking" ? 0.06 : 0.04;
    const floatFreq = mode === "thinking" ? 1.2 : 0.8;
    groupRef.current.position.y = Math.sin(t * floatFreq) * floatAmp;

    // -- Opacity modulation --
    let opacity: number;
    let coreOpacity: number;
    switch (mode) {
      case "thinking":
        opacity = 0.55 + Math.sin(t * 4) * 0.15;
        coreOpacity = 0.25 + Math.sin(t * 6) * 0.2;
        break;
      case "speaking":
        opacity = 0.6 + Math.sin(t * 3) * 0.1;
        coreOpacity = 0.3 + Math.sin(t * 5) * 0.15;
        break;
      default:
        opacity = 0.65;
        coreOpacity = 0.3;
    }
    wireMat.opacity = opacity;
    coreMat.opacity = coreOpacity;

    // -- Geometry selection --
    let outerGeo: THREE.BufferGeometry | undefined;
    let innerGeo: THREE.BufferGeometry | undefined;

    if (desc.generator === "primitive") {
      const key = desc.type as keyof typeof primitives;
      outerGeo = primitives[key];
      innerGeo = primitives[`${key}Inner` as keyof typeof primitives];
      // Fallback to sphere if unknown primitive
      if (!outerGeo) {
        outerGeo = primitives.sphere;
        innerGeo = primitives.sphereInner;
      }
    } else if (desc.generator === "polygon_extrude" && customGeoRef.current) {
      outerGeo = customGeoRef.current.outer;
      innerGeo = customGeoRef.current.inner;
    }

    if (outerGeo && outerMeshRef.current.geometry !== outerGeo) {
      outerMeshRef.current.geometry = outerGeo;
    }
    if (innerGeo && innerMeshRef.current.geometry !== innerGeo) {
      innerMeshRef.current.geometry = innerGeo;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={outerMeshRef}
        geometry={primitives.sphere}
        material={wireMat}
      />
      <mesh
        ref={innerMeshRef}
        geometry={primitives.sphereInner}
        material={coreMat}
      />
    </group>
  );
}
