import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useRef, useMemo } from "react";
import * as THREE from "three";

export default function DynamicPlatforms() {
  const sidePlatformRef     = useRef();
  const elevatePlatformRef  = useRef();
  const rotatePlatformRef   = useRef();
  const yAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const quat  = useMemo(() => new THREE.Quaternion(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Slide left-right
    sidePlatformRef.current?.setNextKinematicTranslation({
      x: 5 * Math.sin(t / 2) - 12,
      y: -0.5,
      z: -10,
    });

    // Rise and spin slowly
    elevatePlatformRef.current?.setNextKinematicTranslation({
      x: -25,
      y: 2 * Math.sin(t / 2) + 2,
      z: 0,
    });
    elevatePlatformRef.current?.setNextKinematicRotation(
      quat.setFromAxisAngle(yAxis, t * 0.4)
    );

    // Slow spin in place
    rotatePlatformRef.current?.setNextKinematicRotation(
      quat.setFromAxisAngle(yAxis, t * 0.4)
    );
  });

  return (
    <>
      {/* Sliding platform */}
      <RigidBody type="kinematicPosition" ref={sidePlatformRef} colliders={false}>
        <CuboidCollider args={[2.5, 0.1, 2.5]} />
        <mesh receiveShadow castShadow>
          <boxGeometry args={[5, 0.2, 5]} />
          <meshStandardMaterial color="#4f9cf9" roughness={0.5} metalness={0.2} />
        </mesh>
      </RigidBody>

      {/* Elevating + rotating platform */}
      <RigidBody type="kinematicPosition" position={[-25, 0, 0]} ref={elevatePlatformRef} colliders={false}>
        <CuboidCollider args={[2.5, 0.1, 2.5]} />
        <mesh receiveShadow castShadow>
          <boxGeometry args={[5, 0.2, 5]} />
          <meshStandardMaterial color="#4ecb71" roughness={0.5} metalness={0.2} />
        </mesh>
      </RigidBody>

      {/* Slow-spinning platform */}
      <RigidBody type="kinematicPosition" position={[-25, -0.5, -10]} ref={rotatePlatformRef} colliders={false}>
        <CuboidCollider args={[2.5, 0.1, 2.5]} />
        <mesh receiveShadow castShadow>
          <boxGeometry args={[5, 0.2, 5]} />
          <meshStandardMaterial color="#c47af9" roughness={0.5} metalness={0.2} />
        </mesh>
      </RigidBody>
    </>
  );
}
