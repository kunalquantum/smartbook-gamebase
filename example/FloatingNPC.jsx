import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A small floating robot NPC that orbits a center point.
 * Pure visual — no physics, no colliders.
 */
export default function FloatingNPC({
  center      = [0, 0, 0],
  color       = "#c8d8f8",
  orbitRadius = 4,
  orbitSpeed  = 0.28,
  floatHeight = 2.0,
  phase       = 0,
  bodyScale   = 1,
}) {
  const groupRef  = useRef();
  const eyeLRef   = useRef();
  const eyeRRef   = useRef();
  const antRef    = useRef();
  const haloRef   = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!groupRef.current) return;

    // Orbit
    groupRef.current.position.x = center[0] + Math.cos(t * orbitSpeed + phase) * orbitRadius;
    groupRef.current.position.z = center[2] + Math.sin(t * orbitSpeed + phase) * orbitRadius;
    // Gentle vertical bob
    groupRef.current.position.y = floatHeight + Math.sin(t * 1.9 + phase) * 0.2;

    // Face the direction of travel (tangent to orbit)
    groupRef.current.rotation.y = t * orbitSpeed + phase + Math.PI / 2;

    // Eye glow pulse
    const pulse = 1.1 + Math.sin(t * 3.2 + phase) * 0.4;
    if (eyeLRef.current) eyeLRef.current.material.emissiveIntensity = pulse;
    if (eyeRRef.current) eyeRRef.current.material.emissiveIntensity = pulse;

    // Antenna orb pulse
    if (antRef.current) antRef.current.material.emissiveIntensity = 1.3 + Math.sin(t * 4 + phase) * 0.5;

    // Halo slowly spins
    if (haloRef.current) haloRef.current.rotation.y = t * 0.6 + phase;
  });

  return (
    <group ref={groupRef} scale={bodyScale}>
      {/* Body — slightly squished sphere */}
      <mesh castShadow scale={[1, 0.82, 1]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.55}
          emissive={color}
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Face panel */}
      <mesh position={[0, 0.02, 0.255]}>
        <boxGeometry args={[0.34, 0.26, 0.01]} />
        <meshStandardMaterial color="#080f1a" roughness={0.1} />
      </mesh>

      {/* Eye L */}
      <mesh ref={eyeLRef} position={[-0.085, 0.06, 0.268]}>
        <boxGeometry args={[0.07, 0.055, 0.01]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.1} />
      </mesh>

      {/* Eye R */}
      <mesh ref={eyeRRef} position={[0.085, 0.06, 0.268]}>
        <boxGeometry args={[0.07, 0.055, 0.01]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.1} />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, -0.07, 0.268]}>
        <boxGeometry args={[0.1, 0.018, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>

      {/* Antenna stem */}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.15, 6]} />
        <meshStandardMaterial color="#1c2b3f" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Antenna orb */}
      <mesh ref={antRef} position={[0, 0.43, 0]}>
        <sphereGeometry args={[0.042, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
      </mesh>

      {/* Floating halo ring */}
      <mesh ref={haloRef} position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.022, 6, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.75} />
      </mesh>

      {/* Soft point light */}
      <pointLight color={color} intensity={0.9} distance={3.5} />
    </group>
  );
}
