import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useSmartbook } from "../src/stores/useSmartbook";

const MARKER_COUNT = 24;
const SPEED = 4; // m/s, fixed wave speed
const AMPLITUDE = 0.6; // m

/**
 * A live travelling-wave demo. Frequency drifts slowly over time; the
 * wavelength is recomputed every frame from wave-speed = frequency *
 * wavelength, and every marker's height is driven by the real sine
 * function for that frequency/wavelength pair — no two frames are scripted
 * the same way twice.
 */
export default function WavesLab({ position = [0, 0, 0] }) {
  const [ox, oy, oz] = position;
  const setWavesState = useSmartbook((s) => s.setWavesState);
  const markerRefs = useRef([]);

  const spacing = 0.45;
  const xs = useMemo(
    () => Array.from({ length: MARKER_COUNT }, (_, i) => (i - (MARKER_COUNT - 1) / 2) * spacing),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const frequency = 0.6 + 0.5 * (1 + Math.sin(t * 0.2)); // oscillates ~0.6-1.6 Hz
    const wavelength = SPEED / frequency;

    xs.forEach((x, i) => {
      const mesh = markerRefs.current[i];
      if (!mesh) return;
      const y = AMPLITUDE * Math.sin((2 * Math.PI * (x / wavelength)) - frequency * t * 2 * Math.PI);
      mesh.position.y = oy + 0.6 + y;
    });

    setWavesState({ frequency, amplitude: AMPLITUDE, speed: SPEED, wavelength });
  });

  return (
    <group>
      {xs.map((x, i) => (
        <mesh
          key={i}
          ref={(el) => (markerRefs.current[i] = el)}
          position={[ox + x, oy + 0.6, oz]}
        >
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#5fd0e0" emissive="#5fd0e0" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Baseline rail for reference */}
      <mesh position={[ox, oy + 0.6, oz]}>
        <boxGeometry args={[xs.length * spacing, 0.01, 0.01]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
