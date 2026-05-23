import { RigidBody } from "@react-three/rapier";

export default function Steps() {
  return (
    <>
      <RigidBody type="fixed" position={[0, -0.9, 5]}>
        <mesh receiveShadow>
          <boxGeometry args={[4, 0.2, 0.2]} />
          <meshStandardMaterial color="#b8a898" roughness={0.85} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, -0.9, 6]}>
        <mesh receiveShadow>
          <boxGeometry args={[4, 0.2, 0.2]} />
          <meshStandardMaterial color="#b8a898" roughness={0.85} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, -0.9, 7]}>
        <mesh receiveShadow>
          <boxGeometry args={[4, 0.2, 0.2]} />
          <meshStandardMaterial color="#b8a898" roughness={0.85} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, -0.9, 8]}>
        <mesh receiveShadow>
          <boxGeometry args={[4, 0.2, 0.2]} />
          <meshStandardMaterial color="#b8a898" roughness={0.85} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, -0.9, 11]}>
        <mesh receiveShadow>
          <boxGeometry args={[4, 0.2, 4]} />
          <meshStandardMaterial color="#c4b4a4" roughness={0.85} />
        </mesh>
      </RigidBody>
    </>
  );
}
