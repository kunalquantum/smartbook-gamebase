import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const matRock  = new THREE.MeshStandardMaterial({ color: "#6a7878", roughness: 0.92 });
const matReeds = new THREE.MeshStandardMaterial({ color: "#5a7a30", roughness: 0.85 });
const matPad   = new THREE.MeshStandardMaterial({
  color: "#3a7a30", roughness: 0.7, side: THREE.DoubleSide,
});

function ShoreRock({ p, s, r }) {
  return (
    <mesh castShadow receiveShadow material={matRock}
      position={p} rotation={r} scale={s}>
      <icosahedronGeometry args={[0.35, 0]} />
    </mesh>
  );
}

function Reed({ position, rotation }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh material={matReeds}>
        <cylinderGeometry args={[0.03, 0.04, 1.1, 5]} />
      </mesh>
      {/* Seed head */}
      <mesh material={matReeds} position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.06, 0.03, 0.28, 5]} />
      </mesh>
    </group>
  );
}

export default function Pond() {
  const waterRef  = useRef();
  const rippleRef = useRef();

  // Procedural ripple ring (expands outward)
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (waterRef.current) {
      // Subtle shimmer
      waterRef.current.material.emissiveIntensity = 0.18 + Math.sin(t * 0.7) * 0.06;
    }
    if (rippleRef.current) {
      // Ripple ring pulses in scale
      const s = 0.6 + ((t * 0.4) % 1) * 0.7;
      rippleRef.current.scale.setScalar(s);
      rippleRef.current.material.opacity = 0.4 * (1 - ((t * 0.4) % 1));
    }
  });

  return (
    <group position={[-5, -0.96, 7]}>

      {/* Pond bed — slightly below water surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <circleGeometry args={[3.8, 36]} />
        <meshStandardMaterial color="#1a4a6a" roughness={0.9} />
      </mesh>

      {/* Water surface */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.6, 36]} />
        <meshStandardMaterial
          color="#2a7aaa"
          emissive="#0a4a7a"
          emissiveIntensity={0.18}
          roughness={0.05}
          metalness={0.85}
          transparent
          opacity={0.82}
        />
      </mesh>

      {/* Expanding ripple ring */}
      <mesh ref={rippleRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.2, 1.35, 32]} />
        <meshBasicMaterial color="#a8d8f8" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Shore rocks */}
      <ShoreRock p={[ 3.5, -0.05,  0.5]} s={0.9} r={[0.3, 1.2, 0.1]} />
      <ShoreRock p={[-3.3, -0.05,  0.8]} s={1.1} r={[0.1, 0.6, 0.4]} />
      <ShoreRock p={[ 1.2, -0.05,  3.5]} s={0.8} r={[0.4, 2.1, 0.2]} />
      <ShoreRock p={[-1.5, -0.05, -3.4]} s={1.0} r={[0.2, 0.9, 0.5]} />
      <ShoreRock p={[ 3.0, -0.05, -2.0]} s={0.7} r={[0.5, 1.8, 0.1]} />

      {/* Lily pads */}
      {[
        [0.8,  0, -1.2,  0.3],
        [-1.4, 0,  0.6,  1.8],
        [1.8,  0,  1.0, -0.4],
        [-0.5, 0, -2.0,  2.5],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} material={matPad} rotation={[-Math.PI / 2, 0, r]} position={[x, 0.02, z]}>
          <circleGeometry args={[0.32, 10, 0.3, Math.PI * 1.75]} />
        </mesh>
      ))}

      {/* Reeds on bank */}
      <Reed position={[ 3.2,  0.45, -1.2]} rotation={0.3} />
      <Reed position={[ 3.5,  0.45,  0.2]} rotation={1.4} />
      <Reed position={[-3.1,  0.45,  1.0]} rotation={2.8} />
      <Reed position={[-2.8,  0.45, -0.8]} rotation={4.2} />
      <Reed position={[ 0.5,  0.45,  3.4]} rotation={0.8} />
      <Reed position={[-0.8,  0.45,  3.6]} rotation={5.1} />

      {/* Soft point light reflecting off water */}
      <pointLight color="#4aa8d8" intensity={1.2} distance={6} position={[0, 0.5, 0]} />
    </group>
  );
}
