"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { JarvisVisualMode } from "./useJarvisVisualState";

// ---------------------------------------------------------------------------
// Future GLB model support:
//
// import { useGLTF } from "@react-three/drei";
//
// Place your humanoid model at: /public/models/jarvis-avatar.glb
// Then replace the procedural geometry below:
//
//   const { scene } = useGLTF("/models/jarvis-avatar.glb");
//   // Traverse and apply wireframe material:
//   scene.traverse((child) => {
//     if ((child as THREE.Mesh).isMesh) {
//       (child as THREE.Mesh).material = wireframeMaterial;
//     }
//   });
//   // Return <primitive object={scene} /> inside the group.
//
// No other file changes required.
// ---------------------------------------------------------------------------

interface JarvisAvatarProps {
  stateRef: React.RefObject<JarvisVisualMode>;
}

// -- Helpers to build body segments ------------------------------------------

function createEllipsoid(
  radiusX: number,
  radiusY: number,
  radiusZ: number,
  segments: number = 12
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, segments, segments);
  geo.scale(radiusX, radiusY, radiusZ);
  return geo;
}

function createLimb(
  length: number,
  radius: number = 0.04,
  segments: number = 6
): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(radius, radius, length, segments);
}

// -- Avatar ------------------------------------------------------------------

export function JarvisAvatar({ stateRef }: JarvisAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const pulseRef = useRef(0);
  const elapsedRef = useRef(0);

  // Shared wireframe material — blue LED emissive
  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#00b4d8"),
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      }),
    []
  );

  // Brighter inner-core material for head/chest accents
  const coreMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#00d4ff"),
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      }),
    []
  );

  // Geometry (memoized — created once)
  const geo = useMemo(
    () => ({
      head: createEllipsoid(0.22, 0.28, 0.24, 10),
      headInner: createEllipsoid(0.15, 0.19, 0.16, 6),
      neck: createLimb(0.18, 0.06, 6),
      torso: createEllipsoid(0.35, 0.5, 0.22, 10),
      torsoCore: createEllipsoid(0.18, 0.28, 0.12, 6),
      shoulderL: new THREE.SphereGeometry(0.1, 6, 6),
      shoulderR: new THREE.SphereGeometry(0.1, 6, 6),
      upperArmL: createLimb(0.4, 0.04, 5),
      upperArmR: createLimb(0.4, 0.04, 5),
      forearmL: createLimb(0.35, 0.035, 5),
      forearmR: createLimb(0.35, 0.035, 5),
      hip: createEllipsoid(0.3, 0.18, 0.18, 8),
      upperLegL: createLimb(0.48, 0.05, 5),
      upperLegR: createLimb(0.48, 0.05, 5),
      lowerLegL: createLimb(0.44, 0.04, 5),
      lowerLegR: createLimb(0.44, 0.04, 5),
      spine: createLimb(0.1, 0.02, 4),
    }),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const mode = stateRef.current ?? "idle";
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    // -- Rotation speed by mode --
    const rotSpeed = mode === "thinking" ? 0.42 : 0.3;
    groupRef.current.rotation.y += delta * rotSpeed;

    // -- Floating / breathing --
    const floatAmp = mode === "speaking" ? 0.06 : 0.04;
    const floatFreq = mode === "thinking" ? 1.2 : 0.8;
    groupRef.current.position.y = Math.sin(t * floatFreq) * floatAmp;

    // Breathing scale on torso
    if (torsoRef.current) {
      const breathe = 1 + Math.sin(t * 1.5) * 0.012;
      torsoRef.current.scale.set(breathe, 1, breathe);
    }

    // -- Speaking forward lean --
    const targetLean = mode === "speaking" ? -0.04 : 0;
    groupRef.current.rotation.x +=
      (targetLean - groupRef.current.rotation.x) * 2 * delta;

    // -- Pulse / glow modulation --
    pulseRef.current += delta;
    const pulse = pulseRef.current;

    let opacity: number;
    let coreOpacity: number;

    switch (mode) {
      case "thinking":
        opacity = 0.55 + Math.sin(pulse * 4) * 0.15;
        coreOpacity = 0.3 + Math.sin(pulse * 6) * 0.2;
        break;
      case "speaking":
        opacity = 0.6 + Math.sin(pulse * 3) * 0.1;
        coreOpacity = 0.35 + Math.sin(pulse * 5) * 0.15;
        break;
      default:
        opacity = 0.6;
        coreOpacity = 0.35;
    }

    wireMat.opacity = opacity;
    coreMat.opacity = coreOpacity;

    // Head subtle nod
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.9) * 0.015;
      headRef.current.rotation.z = Math.sin(t * 0.6) * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {/* --- HEAD --- */}
      <group position={[0, 1.02, 0]} ref={headRef}>
        <mesh geometry={geo.head} material={wireMat} />
        <mesh geometry={geo.headInner} material={coreMat} />
      </group>

      {/* --- NECK --- */}
      <mesh
        geometry={geo.neck}
        material={wireMat}
        position={[0, 0.82, 0]}
      />

      {/* --- TORSO --- */}
      <group ref={torsoRef}>
        <mesh
          geometry={geo.torso}
          material={wireMat}
          position={[0, 0.4, 0]}
        />
        <mesh
          geometry={geo.torsoCore}
          material={coreMat}
          position={[0, 0.45, 0]}
        />
        {/* Spine accent */}
        <mesh
          geometry={geo.spine}
          material={coreMat}
          position={[0, 0.6, -0.1]}
        />
      </group>

      {/* --- SHOULDERS --- */}
      <mesh
        geometry={geo.shoulderL}
        material={wireMat}
        position={[-0.42, 0.72, 0]}
      />
      <mesh
        geometry={geo.shoulderR}
        material={wireMat}
        position={[0.42, 0.72, 0]}
      />

      {/* --- ARMS --- */}
      {/* Left upper arm */}
      <mesh
        geometry={geo.upperArmL}
        material={wireMat}
        position={[-0.46, 0.5, 0]}
        rotation={[0, 0, 0.15]}
      />
      {/* Left forearm */}
      <mesh
        geometry={geo.forearmL}
        material={wireMat}
        position={[-0.5, 0.14, 0.03]}
        rotation={[0.1, 0, 0.1]}
      />
      {/* Right upper arm */}
      <mesh
        geometry={geo.upperArmR}
        material={wireMat}
        position={[0.46, 0.5, 0]}
        rotation={[0, 0, -0.15]}
      />
      {/* Right forearm */}
      <mesh
        geometry={geo.forearmR}
        material={wireMat}
        position={[0.5, 0.14, 0.03]}
        rotation={[0.1, 0, -0.1]}
      />

      {/* --- HIP --- */}
      <mesh
        geometry={geo.hip}
        material={wireMat}
        position={[0, -0.05, 0]}
      />

      {/* --- LEGS --- */}
      {/* Left upper leg */}
      <mesh
        geometry={geo.upperLegL}
        material={wireMat}
        position={[-0.16, -0.38, 0]}
        rotation={[0, 0, 0.03]}
      />
      {/* Left lower leg */}
      <mesh
        geometry={geo.lowerLegL}
        material={wireMat}
        position={[-0.17, -0.82, 0]}
      />
      {/* Right upper leg */}
      <mesh
        geometry={geo.upperLegR}
        material={wireMat}
        position={[0.16, -0.38, 0]}
        rotation={[0, 0, -0.03]}
      />
      {/* Right lower leg */}
      <mesh
        geometry={geo.lowerLegR}
        material={wireMat}
        position={[0.17, -0.82, 0]}
      />
    </group>
  );
}
