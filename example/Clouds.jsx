import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const cloudMat = new THREE.MeshStandardMaterial({
  color: "#f8f8ff",
  roughness: 1,
  metalness: 0,
  transparent: true,
  opacity: 0.88,
});

function Cloud({ base, driftSpeed, driftRadius, phase, scale }) {
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.position.x = base[0] + Math.sin(t * driftSpeed + phase) * driftRadius;
    ref.current.position.y = base[1] + Math.sin(t * driftSpeed * 0.4 + phase) * 0.6;
    ref.current.position.z = base[2] + Math.cos(t * driftSpeed * 0.7 + phase) * driftRadius * 0.5;
  });

  return (
    <group ref={ref} scale={scale}>
      {/* Core puffs */}
      <mesh material={cloudMat} castShadow>
        <sphereGeometry args={[2.2, 8, 6]} />
      </mesh>
      <mesh material={cloudMat} position={[2.2, -0.4, 0.3]}>
        <sphereGeometry args={[1.7, 7, 5]} />
      </mesh>
      <mesh material={cloudMat} position={[-2.0, -0.5, -0.2]}>
        <sphereGeometry args={[1.5, 7, 5]} />
      </mesh>
      <mesh material={cloudMat} position={[0.6, 0.9, 0.4]}>
        <sphereGeometry args={[1.4, 7, 5]} />
      </mesh>
      <mesh material={cloudMat} position={[-0.8, -0.3, 1.2]}>
        <sphereGeometry args={[1.3, 6, 5]} />
      </mesh>
    </group>
  );
}

const CLOUDS = [
  { base: [ 20,  18,  10], driftSpeed: 0.04, driftRadius: 6, phase: 0.0, scale: 1.4 },
  { base: [-25,  22,  -5], driftSpeed: 0.03, driftRadius: 8, phase: 1.8, scale: 1.8 },
  { base: [  5,  16,  30], driftSpeed: 0.05, driftRadius: 5, phase: 3.3, scale: 1.2 },
  { base: [-10,  20, -30], driftSpeed: 0.035,driftRadius: 7, phase: 0.9, scale: 1.6 },
  { base: [ 35,  19,  20], driftSpeed: 0.045,driftRadius: 6, phase: 2.4, scale: 1.0 },
  { base: [-30,  23,  15], driftSpeed: 0.028,driftRadius: 9, phase: 4.1, scale: 2.0 },
  { base: [ 10,  17, -20], driftSpeed: 0.038,driftRadius: 5, phase: 5.5, scale: 1.3 },
];

export default function Clouds() {
  return (
    <>
      {CLOUDS.map((c, i) => <Cloud key={i} {...c} />)}
    </>
  );
}
