import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSmartbook } from "../src/stores/useSmartbook";

const ZONE_CONFIG = {
  math:    { color: "#4f9cf9", label: "Math",    emissive: "#1a6bcc" },
  science: { color: "#4ecb71", label: "Science",  emissive: "#1a8a3e" },
  reading: { color: "#f9a14f", label: "Reading",  emissive: "#cc6a1a" },
  history: { color: "#c47af9", label: "History",  emissive: "#7a1acc" },
};

export default function LearningZone({ zoneId, position }) {
  const orbRef = useRef();
  const pillarRef = useRef();
  const { enterZone, exitZone, currentZone } = useSmartbook();
  const isActive = currentZone === zoneId;
  const { color, emissive } = ZONE_CONFIG[zoneId];

  useFrame((_, delta) => {
    if (!orbRef.current) return;
    orbRef.current.position.y += Math.sin(Date.now() * 0.002) * 0.002;
    orbRef.current.material.emissiveIntensity = isActive
      ? 2 + Math.sin(Date.now() * 0.003) * 0.5
      : 0.8;
    if (pillarRef.current) {
      pillarRef.current.material.emissiveIntensity = isActive ? 1.2 : 0.35;
      pillarRef.current.material.opacity = isActive ? 1 : 0.6;
    }
  });

  return (
    <group position={position}>
      {/* Sensor trigger — invisible, detects character proximity */}
      <RigidBody
        type="fixed"
        sensor
        onIntersectionEnter={() => enterZone(zoneId)}
        onIntersectionExit={() => exitZone(zoneId)}
      >
        <CuboidCollider args={[4.5, 3, 4.5]} position={[0, 1.5, 0]} />
      </RigidBody>

      {/* Platform base */}
      <mesh position={[0, -0.8, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.2, 3.8, 0.4, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isActive ? 0.7 : 0.2}
        />
      </mesh>

      {/* Platform ring glow */}
      <mesh position={[0, -0.58, 0]}>
        <torusGeometry args={[3.2, 0.08, 8, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 2 : 0.6}
        />
      </mesh>

      {/* Pillar */}
      <mesh ref={pillarRef} position={[0, 2, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 5.6, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Orb */}
      <mesh ref={orbRef} position={[0, 5.2, 0]} castShadow>
        <sphereGeometry args={[0.55, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Orb halo ring */}
      <mesh position={[0, 5.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.04, 6, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 3 : 1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Point light — only when active */}
      {isActive && (
        <pointLight
          position={[0, 5.2, 0]}
          color={color}
          intensity={4}
          distance={10}
        />
      )}
    </group>
  );
}
