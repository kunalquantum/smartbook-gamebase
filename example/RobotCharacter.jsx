import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "../src/stores/useGame";
import { BallCollider } from "@react-three/rapier";

// Shared materials — clean white + glowing cyan accents
const matShell  = new THREE.MeshStandardMaterial({ color: "#eef2f8", roughness: 0.1,  metalness: 0.05 });
const matVisor  = new THREE.MeshStandardMaterial({ color: "#060a10", roughness: 0.04, metalness: 0.2  });
const matEye    = new THREE.MeshStandardMaterial({ color: "#00e5ff", emissive: "#00e5ff", emissiveIntensity: 1.6, roughness: 0, metalness: 0 });
const matRing   = new THREE.MeshStandardMaterial({ color: "#40c8ff", emissive: "#40c8ff", emissiveIntensity: 1.4, transparent: true, opacity: 0.85 });
const matThrust = new THREE.MeshStandardMaterial({ color: "#60d8ff", emissive: "#60d8ff", emissiveIntensity: 2.2, transparent: true, opacity: 0.55 });

const animationSet = {
  idle:     "Idle",
  walk:     "Walk",
  run:      "Run",
  jump:     "Jump_Start",
  jumpIdle: "Jump_Idle",
  jumpLand: "Jump_Land",
  fall:     "Climbing",
  action1:  "Wave",
  action2:  "Dance",
  action3:  "Cheer",
  action4:  "Attack(1h)",
};

const ACTION_DURATIONS = {
  [animationSet.action1]: 1800,
  [animationSet.action2]: 3200,
  [animationSet.action3]: 2200,
  [animationSet.action4]: 1200,
};

export default function RobotCharacter(props) {
  const rootRef      = useRef();
  const headRef      = useRef();
  const bodyRef      = useRef();
  const leftWingRef  = useRef();
  const rightWingRef = useRef();
  const eyeLRef      = useRef();
  const eyeRRef      = useRef();
  const thrustRef    = useRef();
  const neckRingRef  = useRef();

  const curAnimation           = useGame((s) => s.curAnimation);
  const initializeAnimationSet = useGame((s) => s.initializeAnimationSet);
  const resetAnimation         = useGame((s) => s.reset);

  useEffect(() => { initializeAnimationSet(animationSet); }, []);

  useEffect(() => {
    const dur = ACTION_DURATIONS[curAnimation];
    if (dur) {
      const id = setTimeout(() => resetAnimation(), dur);
      return () => clearTimeout(id);
    }
  }, [curAnimation]);

  useFrame((state, delta) => {
    if (!rootRef.current) return;
    const t    = state.clock.elapsedTime;
    const lerp = delta * 8;
    const anim = curAnimation;

    // Eye + ring glow pulse
    const eyePulse = 1.4 + Math.sin(t * 2.8) * 0.35;
    if (eyeLRef.current)     eyeLRef.current.material.emissiveIntensity     = eyePulse;
    if (eyeRRef.current)     eyeRRef.current.material.emissiveIntensity     = eyePulse;
    if (neckRingRef.current) neckRingRef.current.material.emissiveIntensity = 1.2 + Math.sin(t * 1.6) * 0.3;
    if (thrustRef.current)   thrustRef.current.material.emissiveIntensity   = 1.8 + Math.sin(t * 7) * 0.6;

    let rootY = 0;
    let bodyX = 0, headX = 0, headZ = 0;
    let lwZ = 0, rwZ = 0;

    if (!anim || anim === animationSet.idle) {
      rootY = Math.sin(t * 1.8) * 0.055;
      lwZ   =  0.06 + Math.sin(t * 1.8) * 0.04;
      rwZ   = -0.06 - Math.sin(t * 1.8) * 0.04;
      headZ = Math.sin(t * 0.9) * 0.02;

    } else if (anim === animationSet.walk) {
      rootY = Math.sin(t * 5.5) * 0.03;
      const s = Math.sin(t * 5.5);
      lwZ =  0.14 + s * 0.16;
      rwZ = -0.14 - s * 0.16;
      bodyX = -0.07;

    } else if (anim === animationSet.run) {
      rootY = Math.sin(t * 10) * 0.045;
      const s = Math.sin(t * 10);
      lwZ =  0.22 + s * 0.28;
      rwZ = -0.22 - s * 0.28;
      bodyX = -0.24;
      headX = -0.12;

    } else if (anim === animationSet.jump || anim === animationSet.jumpIdle) {
      rootY = 0.06;
      lwZ =  0.55;
      rwZ = -0.55;

    } else if (anim === animationSet.jumpLand) {
      rootY = -0.05;
      lwZ =  0.12;
      rwZ = -0.12;

    } else if (anim === animationSet.fall) {
      lwZ =  0.4;
      rwZ = -0.4;
      bodyX = 0.12;

    } else if (anim === animationSet.action1) {
      headZ = Math.sin(t * 8) * 0.22;
      lwZ   =  0.06;
      rwZ   = -0.65 - Math.sin(t * 8) * 0.25;

    } else if (anim === animationSet.action2) {
      const s = Math.sin(t * 7);
      rootY = Math.abs(s) * 0.09;
      headZ = s * 0.28;
      lwZ   =  0.16 + s * 0.32;
      rwZ   = -0.16 + s * 0.32;

    } else if (anim === animationSet.action3) {
      rootY = Math.abs(Math.sin(t * 9)) * 0.11;
      lwZ   =  0.85 + Math.sin(t * 9) * 0.12;
      rwZ   = -0.85 - Math.sin(t * 9) * 0.12;

    } else if (anim === animationSet.action4) {
      bodyX = -0.28 + Math.sin(t * 14) * 0.28;
      lwZ   =  0.55;
      rwZ   = -0.18;
    }

    rootRef.current.position.y      = THREE.MathUtils.lerp(rootRef.current.position.y, rootY, lerp);
    bodyRef.current.rotation.x      = THREE.MathUtils.lerp(bodyRef.current.rotation.x, bodyX, lerp);
    headRef.current.rotation.x      = THREE.MathUtils.lerp(headRef.current.rotation.x, headX, lerp);
    headRef.current.rotation.z      = THREE.MathUtils.lerp(headRef.current.rotation.z, headZ, lerp);
    leftWingRef.current.rotation.z  = THREE.MathUtils.lerp(leftWingRef.current.rotation.z, lwZ, lerp);
    rightWingRef.current.rotation.z = THREE.MathUtils.lerp(rightWingRef.current.rotation.z, rwZ, lerp);
  });

  return (
    <>
      {/* Camera-avoidance collider */}
      <BallCollider args={[0.42]} position={[0, 0.48, 0]} />

      <group {...props} dispose={null}>
        <group ref={rootRef} scale={0.92} position={[0, -0.45, 0]}>

          {/* HEAD */}
          <group ref={headRef} position={[0, 0.76, 0]}>
            {/* Smooth white rounded helmet */}
            <mesh castShadow scale={[1, 0.9, 1]} material={matShell}>
              <sphereGeometry args={[0.38, 28, 20]} />
            </mesh>
            {/* Black visor panel */}
            <mesh position={[0, -0.02, 0.28]} scale={[0.82, 0.68, 0.2]} material={matVisor}>
              <sphereGeometry args={[0.38, 20, 16]} />
            </mesh>
            {/* Left crescent eye — torus arc, happy squint */}
            <mesh ref={eyeLRef} position={[-0.12, 0.05, 0.37]} material={matEye}>
              <torusGeometry args={[0.088, 0.019, 6, 14, Math.PI]} />
            </mesh>
            {/* Right crescent eye */}
            <mesh ref={eyeRRef} position={[0.12, 0.05, 0.37]} material={matEye}>
              <torusGeometry args={[0.088, 0.019, 6, 14, Math.PI]} />
            </mesh>
            {/* Left antenna */}
            <mesh position={[-0.1, 0.43, 0]} material={matShell}>
              <cylinderGeometry args={[0.010, 0.013, 0.27, 7]} />
            </mesh>
            {/* Right antenna */}
            <mesh position={[0.1, 0.43, 0]} material={matShell}>
              <cylinderGeometry args={[0.010, 0.013, 0.27, 7]} />
            </mesh>
          </group>

          {/* BODY */}
          <group ref={bodyRef} position={[0, 0, 0]}>
            {/* Egg/teardrop body */}
            <mesh castShadow scale={[1, 1.38, 1]} material={matShell}>
              <sphereGeometry args={[0.29, 22, 18]} />
            </mesh>
            {/* Glowing neck ring */}
            <mesh ref={neckRingRef} position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} material={matRing}>
              <torusGeometry args={[0.145, 0.018, 8, 22]} />
            </mesh>
            {/* Left wing arm — flat rounded paddle */}
            <group ref={leftWingRef} position={[-0.37, 0.1, 0]}>
              <mesh castShadow scale={[1.7, 0.13, 0.52]} material={matShell}>
                <sphereGeometry args={[0.25, 16, 10]} />
              </mesh>
            </group>
            {/* Right wing arm */}
            <group ref={rightWingRef} position={[0.37, 0.1, 0]}>
              <mesh castShadow scale={[1.7, 0.13, 0.52]} material={matShell}>
                <sphereGeometry args={[0.25, 16, 10]} />
              </mesh>
            </group>
            {/* Thruster glow at bottom */}
            <mesh ref={thrustRef} position={[0, -0.35, 0]} rotation={[Math.PI / 2, 0, 0]} material={matThrust}>
              <torusGeometry args={[0.088, 0.024, 8, 16]} />
            </mesh>
          </group>

        </group>
      </group>
    </>
  );
}
