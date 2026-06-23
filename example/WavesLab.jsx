import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSmartbook } from "../src/stores/useSmartbook";
import { useDrag } from "./useLabDrag";

const MARKER_COUNT = 24;
const SPEED = 4; // m/s, fixed wave speed
const AMPLITUDE = 0.6; // m
const MIN_FREQ = 0.2;
const MAX_FREQ = 3;

/**
 * A live travelling-wave demo. Drag the handle to set the frequency by
 * hand; the wavelength is recomputed every frame from wave-speed =
 * frequency * wavelength, and every marker's height is driven by the real
 * sine function for that frequency/wavelength pair.
 */
export default function WavesLab({ position = [0, 0, 0] }) {
  const [ox, oy, oz] = position;
  const setWavesState = useSmartbook((s) => s.setWavesState);
  const markerRefs = useRef([]);
  const handleRef = useRef(null);
  const frequencyRef = useRef(1);

  const spacing = 0.45;
  const xs = useMemo(
    () => Array.from({ length: MARKER_COUNT }, (_, i) => (i - (MARKER_COUNT - 1) / 2) * spacing),
    []
  );

  const dragHandlers = useDrag({
    onMove: (dx) => {
      frequencyRef.current = THREE.MathUtils.clamp(
        frequencyRef.current + dx * 0.01,
        MIN_FREQ,
        MAX_FREQ
      );
    },
  });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const frequency = frequencyRef.current;
    const wavelength = SPEED / frequency;

    xs.forEach((x, i) => {
      const mesh = markerRefs.current[i];
      if (!mesh) return;
      const y = AMPLITUDE * Math.sin((2 * Math.PI * (x / wavelength)) - frequency * t * 2 * Math.PI);
      mesh.position.y = oy + 0.6 + y;
    });

    if (handleRef.current) {
      handleRef.current.position.x = ox - (xs.length * spacing) / 2 - 0.8;
      handleRef.current.position.y =
        oy + 0.6 + AMPLITUDE * Math.sin(-frequency * t * 2 * Math.PI);
    }

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

      {/* Drag handle — sweep horizontally to change frequency by hand */}
      <mesh ref={handleRef} position={[ox, oy + 0.6, oz]} {...dragHandlers}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffe066" emissive="#ffe066" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}
