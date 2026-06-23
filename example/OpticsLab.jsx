import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSmartbook } from "../src/stores/useSmartbook";

const deg = (rad) => (rad * 180) / Math.PI;
const rad = (d) => (d * Math.PI) / 180;

/**
 * A live optics demo: an oscillating beam of light hits a glass surface.
 * The incidence angle sweeps back and forth; the reflected angle always
 * mirrors it (Law of Reflection) and the refracted angle is computed live
 * from Snell's Law (n1 sin theta1 = n2 sin theta2) — real trig, every frame.
 */
export default function OpticsLab({ position = [0, 0, 0] }) {
  const [ox, oy, oz] = position;
  const setOpticsState = useSmartbook((s) => s.setOpticsState);

  const incidentRef = useRef(null);
  const reflectedRef = useRef(null);
  const refractedRef = useRef(null);

  const n1 = 1.0; // air
  const n2 = 1.5; // glass

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const incidentDeg = 30 + 22 * Math.sin(t * 0.25);
    const incidentRad = rad(incidentDeg);

    const sinRefracted = (n1 / n2) * Math.sin(incidentRad);
    const refractedRad = Math.asin(THREE.MathUtils.clamp(sinRefracted, -1, 1));
    const refractedDeg = deg(refractedRad);

    if (incidentRef.current) incidentRef.current.rotation.z = incidentRad;
    if (reflectedRef.current) reflectedRef.current.rotation.z = -incidentRad;
    if (refractedRef.current) refractedRef.current.rotation.z = Math.PI + refractedRad;

    setOpticsState({
      n1,
      n2,
      incidentAngle: incidentDeg,
      reflectedAngle: incidentDeg,
      refractedAngle: refractedDeg,
    });
  });

  const hitPoint = [ox, oy + 1.3, oz];

  return (
    <group>
      {/* Glass block (refractive medium) */}
      <mesh position={[ox, oy + 0.3, oz]}>
        <boxGeometry args={[3, 2, 3]} />
        <meshPhysicalMaterial
          color="#9fd6ff"
          transparent
          opacity={0.35}
          roughness={0.05}
          transmission={0.6}
        />
      </mesh>

      {/* Surface marker + normal line */}
      <mesh position={hitPoint} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[hitPoint[0], hitPoint[1] + 1, hitPoint[2]]}>
        <cylinderGeometry args={[0.01, 0.01, 2, 6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>

      {/* Incident beam — comes in from above, hits the surface */}
      <group position={hitPoint} ref={incidentRef}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 2, 6]} />
          <meshStandardMaterial color="#ffe066" emissive="#ffe066" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Reflected beam — bounces back at the mirrored angle */}
      <group position={hitPoint} ref={reflectedRef}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 6]} />
          <meshStandardMaterial color="#ff8a4f" emissive="#ff8a4f" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* Refracted beam — bends toward the normal inside the denser glass */}
      <group position={hitPoint} ref={refractedRef}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 6]} />
          <meshStandardMaterial color="#4fd1ff" emissive="#4fd1ff" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  );
}
