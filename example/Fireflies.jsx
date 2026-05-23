import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 70;

export default function Fireflies() {
  const meshRef = useRef();
  const dummy   = useMemo(() => new THREE.Object3D(), []);

  // Each firefly's home position + animation params
  const flies = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      x:     (Math.random() - 0.5) * 60,
      z:     (Math.random() - 0.5) * 60,
      yBase: -0.6 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.1,
      drift: Math.random() * Math.PI * 2,
      driftR: 0.3 + Math.random() * 0.6,
    }))
  , []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    flies.forEach((f, i) => {
      dummy.position.set(
        f.x + Math.sin(t * f.speed * 0.7 + f.drift)  * f.driftR,
        f.yBase + Math.sin(t * f.speed + f.phase)     * 0.35,
        f.z + Math.cos(t * f.speed * 0.5 + f.drift)  * f.driftR
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Pulse emissive intensity as a whole (cheap global glow variation)
    meshRef.current.material.emissiveIntensity = 1.8 + Math.sin(t * 1.2) * 0.5;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <sphereGeometry args={[0.045, 4, 4]} />
      <meshStandardMaterial
        color="#ffe090"
        emissive="#ffcc40"
        emissiveIntensity={2}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}
