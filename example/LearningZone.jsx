import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Html } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSmartbook } from "../src/stores/useSmartbook";

const ZONE_CONFIG = {
  math:    { color: "#4f9cf9", emoji: "∑",  label: "Math",    sub: "Numbers & Patterns"  },
  science: { color: "#4ecb71", emoji: "⚗",  label: "Science",  sub: "Discover & Explore"  },
  reading: { color: "#f9a14f", emoji: "📖", label: "Reading",  sub: "Words & Stories"     },
  history: { color: "#c47af9", emoji: "🏛", label: "History",  sub: "Time & Civilizations"},
};

export default function LearningZone({ zoneId, position }) {
  const floatGroupRef = useRef();
  const scaleRef = useRef(1);
  const { enterZone, exitZone, currentZone, completedZones } = useSmartbook();
  const isActive = currentZone === zoneId;
  const isDone = completedZones.includes(zoneId);
  const { color, emoji, label, sub } = ZONE_CONFIG[zoneId];

  useFrame((state, delta) => {
    if (!floatGroupRef.current) return;

    // Gentle float
    floatGroupRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.9 + position[0] * 0.3) * 0.18;

    // Smooth scale zoom
    const targetScale = isActive ? 1.22 : 1.0;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, delta * 5);
    floatGroupRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <group position={position}>
      {/* Proximity sensor */}
      <RigidBody
        type="fixed"
        sensor
        onIntersectionEnter={() => enterZone(zoneId)}
        onIntersectionExit={() => exitZone(zoneId)}
      >
        <CuboidCollider args={[5, 3.5, 5]} position={[0, 0.5, 0]} />
      </RigidBody>

      {/* Floating card */}
      <group ref={floatGroupRef} position={[0, 2.2, 0]}>
        <Html
          transform
          distanceFactor={9}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              width: 190,
              background: "rgba(8, 8, 22, 0.92)",
              border: `2px solid ${isActive ? color : color + "66"}`,
              borderRadius: 20,
              padding: "26px 28px 22px",
              textAlign: "center",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              boxShadow: isActive
                ? `0 0 32px ${color}55, 0 0 64px ${color}22, inset 0 0 20px ${color}0a`
                : `0 0 16px ${color}22`,
              transition: "box-shadow 0.4s, border-color 0.4s",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {/* Emoji icon */}
            <div
              style={{
                fontSize: 54,
                lineHeight: 1,
                marginBottom: 12,
                filter: isActive ? `drop-shadow(0 0 10px ${color})` : "none",
                transition: "filter 0.4s",
              }}
            >
              {emoji}
            </div>

            {/* Module title */}
            <div
              style={{
                color: color,
                fontSize: 19,
                fontWeight: 700,
                letterSpacing: 0.4,
                marginBottom: 5,
              }}
            >
              {label}
            </div>

            {/* Sub label */}
            <div
              style={{
                color: "rgba(255,255,255,0.38)",
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                marginBottom: isDone ? 10 : 0,
              }}
            >
              {sub}
            </div>

            {/* Completed badge */}
            {isDone && (
              <div
                style={{
                  display: "inline-block",
                  background: `${color}22`,
                  border: `1px solid ${color}66`,
                  borderRadius: 20,
                  padding: "3px 10px",
                  fontSize: 10,
                  color: color,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                ✓ Completed
              </div>
            )}
          </div>
        </Html>

        {/* Thin horizontal base line (3D accent under the card) */}
        <mesh position={[0, -1.4, 0]}>
          <boxGeometry args={[1.2, 0.04, 0.04]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isActive ? 2 : 0.5}
          />
        </mesh>

        {/* Vertical stem down to ground */}
        <mesh position={[0, -2.2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.6, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isActive ? 1.5 : 0.3}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>

      {/* Ground ring marker */}
      <mesh position={[0, -0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.4, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.55 : 0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Active point light */}
      {isActive && (
        <pointLight
          color={color}
          intensity={3.5}
          distance={9}
          position={[0, 2, 0]}
        />
      )}
    </group>
  );
}
