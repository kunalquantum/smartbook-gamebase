import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, CuboidCollider, useRapier } from "@react-three/rapier";
import * as THREE from "three";
import { useSmartbook } from "../src/stores/useSmartbook";
import { useGrabFeedback } from "./useLabDrag";

const LAW3_FLASH_MS = 650;
const FLICK_SENSITIVITY = 0.06;

/** Drag a body across a horizontal plane and fling it on release, clamped to bounds. */
function useFlickDrag(bodyRef, camera, planeY, bounds, grab, sensitivity = FLICK_SENSITIVITY) {
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const total = useRef({ x: 0, y: 0 });

  const toWorld = (e) => {
    const ndc = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
    const hit = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, hit);
    return hit;
  };

  const onPointerDown = (e) => {
    if (!bodyRef.current) return;
    e.stopPropagation();
    e.target.setPointerCapture?.(e.pointerId);
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    total.current = { x: 0, y: 0 };
    bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    grab?.onGrabStart();
  };

  const onPointerMove = (e) => {
    if (!dragging.current || !bodyRef.current) return;
    e.stopPropagation();
    total.current.x += e.clientX - last.current.x;
    total.current.y += e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    const hit = toWorld(e);
    if (hit) {
      const p = bodyRef.current.translation();
      const x = THREE.MathUtils.clamp(hit.x, bounds.minX, bounds.maxX);
      const z = THREE.MathUtils.clamp(hit.z, bounds.minZ, bounds.maxZ);
      bodyRef.current.setTranslation({ x, y: p.y, z }, true);
    }
  };

  const onPointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.target.releasePointerCapture?.(e.pointerId);
    if (bodyRef.current) {
      bodyRef.current.setLinvel(
        { x: total.current.x * sensitivity, y: 0, z: total.current.y * sensitivity },
        true
      );
    }
    grab?.onGrabEnd();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave: onPointerUp,
    onPointerOver: grab?.onPointerOver,
    onPointerOut: grab?.onPointerOut,
  };
}

/** Drag a body straight up/down and let it fall when released. */
function useLiftDrag(bodyRef, minY, maxY, grab) {
  const dragging = useRef(false);
  const startClientY = useRef(0);
  const startY = useRef(0);

  const onPointerDown = (e) => {
    if (!bodyRef.current) return;
    e.stopPropagation();
    e.target.setPointerCapture?.(e.pointerId);
    dragging.current = true;
    startClientY.current = e.clientY;
    startY.current = bodyRef.current.translation().y;
    bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    grab?.onGrabStart();
  };

  const onPointerMove = (e) => {
    if (!dragging.current || !bodyRef.current) return;
    e.stopPropagation();
    const dy = -(e.clientY - startClientY.current) * 0.03;
    const p = bodyRef.current.translation();
    const newY = THREE.MathUtils.clamp(startY.current + dy, minY, maxY);
    bodyRef.current.setTranslation({ x: p.x, y: newY, z: p.z }, true);
    bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
  };

  const onPointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.target.releasePointerCapture?.(e.pointerId);
    grab?.onGrabEnd();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave: onPointerUp,
    onPointerOver: grab?.onPointerOver,
    onPointerOut: grab?.onPointerOut,
  };
}

export default function NewtonsWorldLab({ position = [0, 0, 0] }) {
  const { world } = useRapier();
  const { camera } = useThree();
  const setNewtonState = useSmartbook((s) => s.setNewtonState);

  const [ox, oy, oz] = position;

  // Law 1: Inertia ball — flick-drag it to feel it keep moving until friction/walls act
  const inertiaBall = useRef(null);

  // Law 2: F = m·a — lift the ball and drop it, watch F = m*a measured live
  const law2Ball = useRef(null);
  const law2Mass = 2; // kg
  const prevLaw2Vel = useRef(0);

  // Law 3: equal & opposite reaction — flick the two balls into each other
  const ballA = useRef(null);
  const ballB = useRef(null);
  const massA = 1;
  const massB = 2.4;
  const prevVelA = useRef(0);
  const prevVelB = useRef(0);
  const law3FlashUntil = useRef(0);

  const grabInertia = useGrabFeedback();
  const grabLaw2 = useGrabFeedback();
  const grabA = useGrabFeedback();
  const grabB = useGrabFeedback();

  const wallBounds = { minX: ox - 6, maxX: ox + 6, minZ: oz - 6, maxZ: oz + 6 };
  const dragInertia = useFlickDrag(inertiaBall, camera, oy + 0.4, wallBounds, grabInertia);
  const dragLaw2 = useLiftDrag(law2Ball, oy + 0.5, oy + 6, grabLaw2);
  const dragA = useFlickDrag(ballA, camera, oy + 0.5, wallBounds, grabA);
  const dragB = useFlickDrag(ballB, camera, oy + 0.5, wallBounds, grabB);

  useFrame((state, delta) => {
    if (delta <= 0) return;
    const t = state.clock.elapsedTime;
    const g = Math.abs(world.gravity.y);

    // Law 1 readout
    let velocity = 0;
    if (inertiaBall.current) {
      const v = inertiaBall.current.linvel();
      velocity = Math.hypot(v.x, v.z);
    }

    // Law 2: measure live acceleration & force as the lifted ball falls
    let force2 = law2Mass * g;
    let accel2 = g;
    if (law2Ball.current) {
      const v = law2Ball.current.linvel();
      const speed = Math.abs(v.y);
      accel2 = Math.max(0, (speed - prevLaw2Vel.current) / delta);
      if (accel2 < 0.01 || accel2 > g * 3) accel2 = g;
      force2 = law2Mass * accel2;
      prevLaw2Vel.current = speed;
    }

    // Law 3: detect impulse exchange whenever the two balls actually collide
    let forceA = 0;
    let forceB = 0;
    let law3Active = t < law3FlashUntil.current;
    if (ballA.current && ballB.current) {
      const va = ballA.current.linvel().x;
      const vb = ballB.current.linvel().x;
      const dvA = va - prevVelA.current;
      const dvB = vb - prevVelB.current;

      if (Math.abs(dvA) > 0.4 && Math.abs(dvB) > 0.4 && Math.sign(dvA) !== Math.sign(dvB)) {
        forceA = (massA * dvA) / delta;
        forceB = (massB * dvB) / delta;
        law3FlashUntil.current = t + LAW3_FLASH_MS / 1000;
        law3Active = true;
      }
      prevVelA.current = va;
      prevVelB.current = vb;
    }

    setNewtonState({
      gravity: g,
      law1: { velocity, atRest: velocity < 0.05 },
      law2: { mass: law2Mass, acceleration: accel2, force: force2 },
      law3: {
        active: law3Active,
        massA,
        massB,
        forceA: law3Active ? forceA : 0,
        forceB: law3Active ? forceB : 0,
      },
    });
  });

  return (
    <group>
      {/* Lab floor patch */}
      <mesh position={[ox, oy - 0.99, oz]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.5, 48]} />
        <meshStandardMaterial color="#1c2a22" transparent opacity={0.35} />
      </mesh>

      {/* Invisible walls */}
      <RigidBody type="fixed" restitution={1} friction={0}>
        <CuboidCollider args={[0.2, 2, 6.5]} position={[ox - 6.5, oy + 1, oz]} />
        <CuboidCollider args={[0.2, 2, 6.5]} position={[ox + 6.5, oy + 1, oz]} />
        <CuboidCollider args={[6.5, 2, 0.2]} position={[ox, oy + 1, oz - 6.5]} />
        <CuboidCollider args={[6.5, 2, 0.2]} position={[ox, oy + 1, oz + 6.5]} />
      </RigidBody>

      {/* Law 1 station — flick-drag the apple to set it moving */}
      <group position={[ox - 4, 0, oz - 4]}>
        <RigidBody ref={inertiaBall} colliders="ball" linearDamping={0} angularDamping={0.4} friction={0} restitution={1} gravityScale={1}>
          <mesh castShadow scale={grabInertia.grabbed ? 1.15 : grabInertia.hovered ? 1.08 : 1} {...dragInertia}>
            <sphereGeometry args={[0.4, 24, 24]} />
            <meshStandardMaterial
              color="#e0413f"
              roughness={0.4}
              emissive="#e0413f"
              emissiveIntensity={grabInertia.grabbed ? 0.7 : grabInertia.hovered ? 0.35 : 0}
            />
          </mesh>
        </RigidBody>
      </group>

      {/* Law 2 station — lift and release the ball to feel F = m*a */}
      <group>
        <RigidBody ref={law2Ball} colliders="ball" position={[ox, oy + 0.5, oz - 3]} linearDamping={0} friction={0.3} restitution={0.2} gravityScale={1}>
          <mesh castShadow scale={grabLaw2.grabbed ? 1.15 : grabLaw2.hovered ? 1.08 : 1} {...dragLaw2}>
            <sphereGeometry args={[0.45, 24, 24]} />
            <meshStandardMaterial
              color="#4f9cf9"
              roughness={0.4}
              emissive="#4f9cf9"
              emissiveIntensity={grabLaw2.grabbed ? 0.7 : grabLaw2.hovered ? 0.35 : 0}
            />
          </mesh>
        </RigidBody>
        <mesh position={[ox, oy - 0.95, oz - 3]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial color="#4f9cf9" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Law 3 station — flick either ball into the other to see equal & opposite force */}
      <group>
        <RigidBody ref={ballA} colliders="ball" position={[ox - 4, oy + 0.5, oz + 4]} linearDamping={0} friction={0} restitution={0.9} gravityScale={0}>
          <mesh castShadow scale={grabA.grabbed ? 1.15 : grabA.hovered ? 1.08 : 1} {...dragA}>
            <sphereGeometry args={[0.35, 24, 24]} />
            <meshStandardMaterial
              color="#f9d54f"
              roughness={0.4}
              emissive="#f9d54f"
              emissiveIntensity={grabA.grabbed ? 0.7 : grabA.hovered ? 0.35 : 0}
            />
          </mesh>
        </RigidBody>
        <RigidBody ref={ballB} colliders="ball" position={[ox + 4, oy + 0.5, oz + 4]} linearDamping={0} friction={0} restitution={0.9} gravityScale={0}>
          <mesh castShadow scale={(grabB.grabbed ? 1.15 : grabB.hovered ? 1.08 : 1) * 1.2} {...dragB}>
            <sphereGeometry args={[0.35, 24, 24]} />
            <meshStandardMaterial
              color="#c47af9"
              roughness={0.4}
              emissive="#c47af9"
              emissiveIntensity={grabB.grabbed ? 0.7 : grabB.hovered ? 0.35 : 0}
            />
          </mesh>
        </RigidBody>
      </group>
    </group>
  );
}
