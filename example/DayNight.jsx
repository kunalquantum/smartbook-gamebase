import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import * as THREE from "three";

// One full day cycle ≈ 8 minutes real time
const SPEED = 0.013;

export default function DayNight() {
  const skyRef    = useRef();
  const dirRef    = useRef();
  const ambRef    = useRef();
  const hemiRef   = useRef();
  const sunVec    = useRef(new THREE.Vector3());

  useFrame((state) => {
    const t = state.clock.elapsedTime * SPEED + Math.PI * 0.35; // start mid-morning
    const sunX =  Math.cos(t) * 100;
    const sunY =  Math.sin(t) * 90;
    const sunZ =  60;

    sunVec.current.set(sunX, sunY, sunZ);

    // Push sun position directly into Sky shader — no React re-render
    if (skyRef.current?.material?.uniforms?.sunPosition) {
      skyRef.current.material.uniforms.sunPosition.value.copy(sunVec.current);
    }

    const day    = Math.max(0, sunY / 90);          // 0 = horizon/night, 1 = noon
    const sunset = Math.max(0, 0.5 - Math.abs(day - 0.18) * 4); // orange band near horizon

    if (dirRef.current) {
      dirRef.current.position.copy(sunVec.current);
      dirRef.current.color.setRGB(
        0.55 + 0.45 * day + 0.5 * sunset,
        0.45 + 0.45 * day + 0.1 * sunset,
        0.35 + 0.4  * day - 0.2 * sunset
      );
      dirRef.current.intensity = Math.max(0, 4.5 * day + 2.5 * sunset);
    }

    if (ambRef.current) {
      ambRef.current.color.setRGB(
        0.32 + 0.4 * day + 0.3 * sunset,
        0.42 + 0.35 * day,
        0.65 + 0.15 * day
      );
      ambRef.current.intensity = 0.3 + 1.1 * day + 0.4 * sunset;
    }

    if (hemiRef.current) {
      hemiRef.current.intensity = 0.2 + 0.5 * day;
    }
  });

  return (
    <>
      <Sky ref={skyRef} />

      <directionalLight
        ref={dirRef}
        castShadow
        name="followLight"
        position={[100, 30, 60]}
        intensity={4}
        color="#ffe4b0"
        shadow-normalBias={0.06}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-top={60}
        shadow-camera-right={60}
        shadow-camera-bottom={-60}
        shadow-camera-left={-60}
      />
      <ambientLight ref={ambRef} color="#a8c8e8" intensity={1.4} />
      <hemisphereLight ref={hemiRef} skyColor="#a8c8e8" groundColor="#6a9a50" intensity={0.6} />
    </>
  );
}
