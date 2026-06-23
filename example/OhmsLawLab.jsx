import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSmartbook } from "../src/stores/useSmartbook";

const RESISTOR_PRESETS = [2, 5, 10, 20]; // ohms
const SWAP_EVERY = 3.5; // seconds
const VOLTAGE = 9; // V, fixed battery

/**
 * A live circuit demo: a fixed 9V battery drives current through a
 * swappable resistor into an LED. Current = V / R is recalculated every
 * frame as the resistance changes, and the LED's actual emissive
 * brightness is driven by that live current value.
 */
export default function OhmsLawLab({ position = [0, 0, 0] }) {
  const [ox, oy, oz] = position;
  const setOhmsState = useSmartbook((s) => s.setOhmsState);
  const ledRef = useRef(null);
  const timer = useRef(0);
  const presetIdx = useRef(0);

  useFrame((state, delta) => {
    timer.current += delta;
    if (timer.current > SWAP_EVERY) {
      timer.current = 0;
      presetIdx.current = (presetIdx.current + 1) % RESISTOR_PRESETS.length;
    }
    const resistance = RESISTOR_PRESETS[presetIdx.current];
    const current = VOLTAGE / resistance;

    if (ledRef.current) {
      const maxCurrent = VOLTAGE / RESISTOR_PRESETS[0];
      ledRef.current.material.emissiveIntensity = 0.4 + (current / maxCurrent) * 4;
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

      {/* Resistor (zig-zag) */}
      <group position={[ox, oy + 0.4, oz]}>
        {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
          <mesh key={i} position={[x, i % 2 === 0 ? 0.08 : -0.08, 0]} rotation={[0, 0, i % 2 === 0 ? 0.6 : -0.6]}>
            <cylinderGeometry args={[0.04, 0.04, 0.26, 6]} />
            <meshStandardMaterial color="#caa14f" />
          </mesh>
        ))}
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
