import {
  BallCollider,
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";

export default function RigidObjects() {
  return (
    <>
      <RigidBody position={[15, 1, 2]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#8abbd8" roughness={0.5} />
        </mesh>
      </RigidBody>
      <RigidBody position={[15.1, 0, 2]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#8abbd8" roughness={0.5} />
        </mesh>
      </RigidBody>
      <RigidBody position={[15, 0, 0]} colliders={false}>
        <CuboidCollider args={[0.5, 0.5, 0.5]} />
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#9ec4d8" roughness={0.5} />
        </mesh>
      </RigidBody>
      <RigidBody position={[15, 0, -2]} colliders={false}>
        <CuboidCollider args={[1.5 / 2, 1.5 / 2, 1.5 / 2]} />
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#aed0e0" roughness={0.5} />
        </mesh>
      </RigidBody>
      <RigidBody position={[15, 0, -5]} colliders={false}>
        <CuboidCollider args={[1, 1, 1]} />
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#bed8e8" roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* Spinning top toy */}
      <RigidBody colliders={false} position={[15, 5, -10]}>
        <CylinderCollider args={[0.03, 2.5]} position={[0, 0.25, 0]} />
        <BallCollider args={[0.25]} />
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[2.5, 0.2, 0.5]} />
          <meshStandardMaterial color="#7ab8d4" roughness={0.4} metalness={0.1} />
        </mesh>
      </RigidBody>
    </>
  );
}
