import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSmartbook } from "../src/stores/useSmartbook";
import { useDrag } from "./useLabDrag";

const MIN_OHMS = 1;
const MAX_OHMS = 30;
const VOLTAGE = 9; // V, fixed battery

/**
 * A live circuit demo: drag the resistor up/down to change its resistance
 * by hand. Current = V / R is recalculated every frame as the resistance
 * changes, and the LED's actual emissive brightness is driven by that live
 * current value.
 */
export default function OhmsLawLab({ position = [0, 0, 0] }) {
  const [ox, oy, oz] = position;
  const setOhmsState = useSmartbook((s) => s.setOhmsState);
  const ledRef = useRef(null);
  const resistorRef = useRef(null);
  const resistanceRef = useRef(10);

  const dragHandlers = useDrag({
    onMove: (_dx, dy) => {
      resistanceRef.current = THREE.MathUtils.clamp(
        resistanceRef.current + dy * 0.08,
        MIN_OHMS,
        MAX_OHMS
      );
    },
  });

  useFrame(() => {
    const resistance = resistanceRef.current;
    const current = VOLTAGE / resistance;

    if (ledRef.current) {
      const maxCurrent = VOLTAGE / MIN_OHMS;
      ledRef.current.material.emissiveIntensity = 0.4 + (current / maxCurrent) * 4;
    }
    if (resistorRef.current) {
      const scale = 0.6 + (resistance / MAX_OHMS) * 0.8;
      resistorRef.current.scale.y = scale;
    }

    setOhmsState({ voltage: VOLTAGE, resistance, current });
  });

  return (
    <group>
      {/* Battery */}
      <mesh position={[ox - 1.6, oy + 0.4, oz]}>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>
      <mesh position={[ox - 1.6, oy + 0.85, oz]}>
        <cylinderGeometry args={[0.12, 0.12, 0.1, 12]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>

      {/* Resistor (zig-zag) — drag vertically to change resistance */}
      <group ref={resistorRef} position={[ox, oy + 0.4, oz]} {...dragHandlers}>
        {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
          <mesh key={i} position={[x, i % 2 === 0 ? 0.08 : -0.08, 0]} rotation={[0, 0, i % 2 === 0 ? 0.6 : -0.6]}>
            <cylinderGeometry args={[0.04, 0.04, 0.26, 6]} />
            <meshStandardMaterial color="#caa14f" />
          </mesh>
        ))}
        {/* invisible bigger hitbox for easier grabbing */}
        <mesh visible={false}>
          <boxGeometry args={[0.9, 0.5, 0.5]} />
        </mesh>
      </group>

      {/* LED bulb — brightness driven by live current */}
      <mesh position={[ox + 1.6, oy + 0.4, oz]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial
          ref={ledRef}
          color="#ffdd55"
          emissive="#ffaa00"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Wire loop */}
      <mesh position={[ox, oy + 0.05, oz]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.62, 32, 1, 0, Math.PI * 2]} />
        <meshBasicMaterial color="#888" />
      </mesh>
    </group>
  );
}
