import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, CuboidCollider, useRapier } from "@react-three/rapier";
import * as THREE from "three";
import { useSmartbook } from "../src/stores/useSmartbook";
import { useGrabFeedback } from "./useLabDrag";

const MASS = 1.5; // kg
const VALLEY_HALF_WIDTH = 3.6;
const MAX_LIFT_Y = 4.5;

/**
 * A live energy-conservation demo: a real ball (driven by Rapier, not
 * scripted) rolls back and forth in a shallow valley. Every frame we read
 * its actual height and speed off the rigid body and compute
 * PE = m*g*h and KE = 0.5*m*v^2 — watch them trade off while their sum
 * stays roughly constant. Grab the ball with the mouse to lift it and
 * release to let gravity pull it back down.
 */
export default function EnergyLab({ position = [0, 0, 0] }) {
  const [ox, oy, oz] = position;
  const { world } = useRapier();
  const { camera } = useThree();
  const setEnergyState = useSmartbook((s) => s.setEnergyState);
  const ballRef = useRef(null);
  const lowPointY = oy - 0.3;
  const dragging = useRef(false);
  const dragPlaneY = useRef(0);
  const grab = useGrabFeedback();

  const onPointerDown = (e) => {
    if (!ballRef.current) return;
    e.stopPropagation();
    e.target.setPointerCapture?.(e.pointerId);
    dragging.current = true;
    dragPlaneY.current = Math.min(ballRef.current.translation().y, MAX_LIFT_Y);
    ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    grab.onGrabStart();
  };

  const onPointerMove = (e) => {
    if (!dragging.current || !ballRef.current) return;
    e.stopPropagation();
    const ndc = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -dragPlaneY.current);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, hit)) {
      const x = THREE.MathUtils.clamp(hit.x, ox - VALLEY_HALF_WIDTH, ox + VALLEY_HALF_WIDTH);
      const z = THREE.MathUtils.clamp(hit.z, oz - VALLEY_HALF_WIDTH, oz + VALLEY_HALF_WIDTH);
      ballRef.current.setTranslation({ x, y: dragPlaneY.current, z }, true);
      ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  };

  const onPointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.target.releasePointerCapture?.(e.pointerId);
    grab.onGrabEnd();
  };

  useFrame(() => {
    if (!ballRef.current) return;
    const g = Math.abs(world.gravity.y);
    const p = ballRef.current.translation();
    const v = ballRef.current.linvel();
    const height = Math.max(0, p.y - lowPointY);
    const speed = Math.hypot(v.x, v.y, v.z);

    const pe = MASS * g * height;
    const ke = 0.5 * MASS * speed * speed;

    setEnergyState({ mass: MASS, height, velocity: speed, pe, ke, total: pe + ke });
  });

  return (
    <group>
      {/* Valley ramps — fixed colliders forming a shallow V */}
      <RigidBody type="fixed" friction={0.15} restitution={0.35}>
        <CuboidCollider
          args={[1.7, 0.15, 1.1]}
          position={[ox - 1.7, oy + 0.35, oz]}
          rotation={[0, 0, 0.42]}
        />
        <CuboidCollider
          args={[1.7, 0.15, 1.1]}
          position={[ox + 1.7, oy + 0.35, oz]}
          rotation={[0, 0, -0.42]}
        />
        {/* visual ramps */}
        <mesh position={[ox - 1.7, oy + 0.35, oz]} rotation={[0, 0, 0.42]}>
          <boxGeometry args={[3.4, 0.3, 2.2]} />
          <meshStandardMaterial color="#3b2a55" roughness={0.8} />
        </mesh>
        <mesh position={[ox + 1.7, oy + 0.35, oz]} rotation={[0, 0, -0.42]}>
          <boxGeometry args={[3.4, 0.3, 2.2]} />
          <meshStandardMaterial color="#3b2a55" roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* The energy ball */}
      <RigidBody
        ref={ballRef}
        colliders="ball"
        position={[ox - 2.6, oy + 2.2, oz]}
        friction={0.15}
        restitution={0.35}
        linearDamping={0.02}
      >
        <mesh
          castShadow
          scale={grab.grabbed ? 1.15 : grab.hovered ? 1.08 : 1}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerOver={grab.onPointerOver}
          onPointerOut={grab.onPointerOut}
        >
          <sphereGeometry args={[0.32, 24, 24]} />
          <meshStandardMaterial
            color="#c47af9"
            roughness={0.35}
            emissive="#c47af9"
            emissiveIntensity={grab.grabbed ? 0.7 : grab.hovered ? 0.35 : 0}
          />
        </mesh>
      </RigidBody>
    </group>
  );
}
