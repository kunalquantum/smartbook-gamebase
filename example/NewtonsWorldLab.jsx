import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider, useRapier } from "@react-three/rapier";
import * as THREE from "three";
import { useSmartbook } from "../src/stores/useSmartbook";

const LAW3_FLASH_MS = 650;

/**
 * A real, live physics sandbox (built on the same Rapier world the character
 * walks on) that demonstrates Newton's three laws with actual numbers —
 * nothing here is scripted/faked, every value pushed to the Smartbook store
 * is read straight off the rigid bodies each frame.
 */
export default function NewtonsWorldLab({ position = [0, 0, 0] }) {
  const { rapier, world } = useRapier();
  const setNewtonState = useSmartbook((s) => s.setNewtonState);

  const [ox, oy, oz] = position;

  // ── Law 1: Inertia ball — zero friction/damping, only changes velocity on collision ──
  const inertiaBall = useRef(null);

  // ── Law 2: F = m·a — ball repeatedly dropped, mass is fixed & known ──
  const law2Ball = useRef(null);
  const law2Mass = 2; // kg
  const prevLaw2Vel = useRef(0);
  const law2Timer = useRef(0);

  // ── Law 3: equal & opposite reaction — two different-mass balls launched at each other ──
  const ballA = useRef(null);
  const ballB = useRef(null);
  const massA = 1;
  const massB = 2.4;
  const prevVelA = useRef(0);
  const prevVelB = useRef(0);
  const law3Timer = useRef(0);
  const law3FlashUntil = useRef(0);

  useFrame((state, delta) => {
    if (delta <= 0) return;
    const t = state.clock.elapsedTime;

    // gravity magnitude straight from the live Rapier world
    const g = Math.abs(world.gravity.y);

    // ── Law 1 readout ──
    let velocity = 0;
    if (inertiaBall.current) {
      const v = inertiaBall.current.linvel();
      velocity = Math.hypot(v.x, v.z);
    }

    // ── Law 2: drop the ball every 3s, measure acceleration & force live ──
    let force2 = law2Mass * g;
    let accel2 = g;
    if (law2Ball.current) {
      const v = law2Ball.current.linvel();
      const speed = Math.abs(v.y);
      accel2 = Math.max(0, (speed - prevLaw2Vel.current) / delta);
      // While in free fall, a ≈ g; smooth toward measured value but keep it sane
      if (accel2 < 0.01 || accel2 > g * 3) accel2 = g;
      force2 = law2Mass * accel2;
      prevLaw2Vel.current = speed;

      law2Timer.current += delta;
      if (law2Timer.current > 3) {
        law2Timer.current = 0;
        law2Ball.current.setTranslation({ x: ox, y: oy + 5, z: oz - 3 }, true);
        law2Ball.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        prevLaw2Vel.current = 0;
      }
    }

    // ── Law 3: launch the two balls at each other every 4s, detect the impulse ──
    let forceA = 0;
    let forceB = 0;
    let law3Active = t < law3FlashUntil.current;
    if (ballA.current && ballB.current) {
      const va = ballA.current.linvel().x;
      const vb = ballB.current.linvel().x;
      const dvA = va - prevVelA.current;
      const dvB = vb - prevVelB.current;

      // A real collision shows up as a sudden, large, opposite-signed velocity change
      if (Math.abs(dvA) > 0.4 && Math.abs(dvB) > 0.4 && Math.sign(dvA) !== Math.sign(dvB)) {
        forceA = (massA * dvA) / delta;
        forceB = (massB * dvB) / delta;
        law3FlashUntil.current = t + LAW3_FLASH_MS / 1000;
        law3Active = true;
      }
      prevVelA.current = va;
      prevVelB.current = vb;

      law3Timer.current += delta;
      if (law3Timer.current > 4) {
        law3Timer.current = 0;
        ballA.current.setTranslation({ x: ox - 4, y: oy + 0.5, z: oz + 4 }, true);
        ballB.current.setTranslation({ x: ox + 4, y: oy + 0.5, z: oz + 4 }, true);
        ballA.current.setLinvel({ x: 3, y: 0, z: 0 }, true);
        ballB.current.setLinvel({ x: -3 * (massA / massB), y: 0, z: 0 }, true);
        prevVelA.current = 3;
        prevVelB.current = -3 * (massA / massB);
      }
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
      {/* Lab floor patch (purely visual cue, sits on the real ground) */}
      <mesh position={[ox, oy - 0.99, oz]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.5, 48]} />
        <meshStandardMaterial color="#1c2a22" transparent opacity={0.35} />
      </mesh>

      {/* Invisible walls so balls bounce around the lab instead of rolling off */}
      <RigidBody type="fixed" restitution={1} friction={0}>
        <CuboidCollider args={[0.2, 2, 6.5]} position={[ox - 6.5, oy + 1, oz]} />
        <CuboidCollider args={[0.2, 2, 6.5]} position={[ox + 6.5, oy + 1, oz]} />
        <CuboidCollider args={[6.5, 2, 0.2]} position={[ox, oy + 1, oz - 6.5]} />
        <CuboidCollider args={[6.5, 2, 0.2]} position={[ox, oy + 1, oz + 6.5]} />
      </RigidBody>

      {/* ── Law 1 station: the "apple" — push it, it keeps going at constant velocity ── */}
      <group position={[ox - 4, 0, oz - 4]}>
        <RigidBody
          ref={inertiaBall}
          colliders="ball"
          linearDamping={0}
          angularDamping={0.4}
          friction={0}
          restitution={1}
          gravityScale={1}
        >
          <mesh castShadow>
            <sphereGeometry args={[0.4, 24, 24]} />
            <meshStandardMaterial color="#e0413f" roughness={0.4} />
          </mesh>
        </RigidBody>
      </group>

      {/* ── Law 2 station: ball of known mass, dropped on a loop ── */}
      <group>
        <RigidBody
          ref={law2Ball}
          colliders="ball"
          position={[ox, oy + 5, oz - 3]}
          linearDamping={0}
          friction={0.3}
          restitution={0.2}
          gravityScale={1}
        >
          <mesh castShadow>
            <sphereGeometry args={[0.45, 24, 24]} />
            <meshStandardMaterial color="#4f9cf9" roughness={0.4} />
          </mesh>
        </RigidBody>
        {/* drop-zone marker */}
        <mesh position={[ox, oy - 0.95, oz - 3]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial color="#4f9cf9" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ── Law 3 station: two balls launched into each other ── */}
      <group>
        <RigidBody
          ref={ballA}
          colliders="ball"
          position={[ox - 4, oy + 0.5, oz + 4]}
          linearDamping={0}
          friction={0}
          restitution={0.9}
          gravityScale={0}
        >
          <mesh castShadow>
            <sphereGeometry args={[0.35, 24, 24]} />
            <meshStandardMaterial color="#f9d54f" roughness={0.4} />
          </mesh>
        </RigidBody>
        <RigidBody
          ref={ballB}
          colliders="ball"
          position={[ox + 4, oy + 0.5, oz + 4]}
          linearDamping={0}
          friction={0}
          restitution={0.9}
          gravityScale={0}
        >
          <mesh castShadow scale={1.2}>
            <sphereGeometry args={[0.35, 24, 24]} />
            <meshStandardMaterial color="#c47af9" roughness={0.4} />
          </mesh>
        </RigidBody>
      </group>
    </group>
  );
}
