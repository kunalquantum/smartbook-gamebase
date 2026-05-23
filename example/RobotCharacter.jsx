import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "../src/stores/useGame";
import { BallCollider } from "@react-three/rapier";

// Shared materials — defined once, reused across meshes
const matBody    = new THREE.MeshStandardMaterial({ color: "#1c2b3f", roughness: 0.35, metalness: 0.65 });
const matPanel   = new THREE.MeshStandardMaterial({ color: "#2a3d5a", roughness: 0.4,  metalness: 0.5  });
const matAccent  = new THREE.MeshStandardMaterial({ color: "#4a9df8", roughness: 0.25, metalness: 0.3, emissive: "#4a9df8", emissiveIntensity: 0.25 });
const matFace    = new THREE.MeshStandardMaterial({ color: "#0a1525", roughness: 0.1,  metalness: 0.05 });
const matEye     = new THREE.MeshStandardMaterial({ color: "#00e5ff", emissive: "#00e5ff", emissiveIntensity: 1.4 });
const matMouth   = new THREE.MeshStandardMaterial({ color: "#4a9df8", emissive: "#4a9df8", emissiveIntensity: 0.9 });
const matOrb     = new THREE.MeshStandardMaterial({ color: "#4a9df8", emissive: "#4a9df8", emissiveIntensity: 1.6 });
const matJoint   = new THREE.MeshStandardMaterial({ color: "#4a9df8", roughness: 0.2,  metalness: 0.7, emissive: "#4a9df8", emissiveIntensity: 0.15 });

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
  const bodyRef      = useRef();
  const headRef      = useRef();
  const leftArmRef   = useRef();
  const rightArmRef  = useRef();
  const leftLegRef   = useRef();
  const rightLegRef  = useRef();
  const eyeLRef      = useRef();
  const eyeRRef      = useRef();
  const antOrbRef    = useRef();

  const curAnimation         = useGame((s) => s.curAnimation);
  const initializeAnimationSet = useGame((s) => s.initializeAnimationSet);
  const resetAnimation       = useGame((s) => s.reset);

  useEffect(() => { initializeAnimationSet(animationSet); }, []);

  // One-shot action timer
  useEffect(() => {
    const dur = ACTION_DURATIONS[curAnimation];
    if (dur) {
      const id = setTimeout(() => resetAnimation(), dur);
      return () => clearTimeout(id);
    }
  }, [curAnimation]);

  useFrame((state, delta) => {
    if (!rootRef.current) return;
    const t     = state.clock.elapsedTime;
    const lerp  = delta * 9;
    const anim  = curAnimation;

    // Eye + antenna pulse — always on
    if (eyeLRef.current)   eyeLRef.current.material.emissiveIntensity   = 1.2 + Math.sin(t * 2.8) * 0.3;
    if (eyeRRef.current)   eyeRRef.current.material.emissiveIntensity   = 1.2 + Math.sin(t * 2.8) * 0.3;
    if (antOrbRef.current) antOrbRef.current.material.emissiveIntensity = 1.4 + Math.sin(t * 3.5) * 0.6;

    // Animation targets
    let rootY = 0;
    let bodyX = 0, headX = 0;
    let laX = 0, laZ = 0;
    let raX = 0, raZ = 0;
    let llX = 0, rlX = 0;

    if (!anim || anim === animationSet.idle) {
      rootY = Math.sin(t * 1.8) * 0.04;
      laX   = Math.sin(t * 1.8) * 0.06;
      raX   = Math.sin(t * 1.8) * 0.06;
      headX = Math.sin(t * 1.2) * 0.03;

    } else if (anim === animationSet.walk) {
      const s = Math.sin(t * 5.5);
      laX =  s * 0.5;  raX = -s * 0.5;
      llX = -s * 0.5;  rlX =  s * 0.5;

    } else if (anim === animationSet.run) {
      const s = Math.sin(t * 10);
      laX =  s * 0.78;  raX = -s * 0.78;
      llX = -s * 0.68;  rlX =  s * 0.68;
      bodyX = -0.18;    headX = -0.12;

    } else if (anim === animationSet.jump) {
      laX = -1.1;  raX = -1.1;
      llX =  0.3;  rlX = -0.3;

    } else if (anim === animationSet.jumpIdle) {
      laX = -0.65; raX = -0.65;

    } else if (anim === animationSet.jumpLand) {
      laX = 0.6; raX = 0.6;
      llX = 0.4; rlX = 0.4;

    } else if (anim === animationSet.fall) {
      laX = -0.45; raX = -0.45;
      laZ = -0.65; raZ =  0.65;

    } else if (anim === animationSet.action1) {
      // Wave — right arm up + oscillate
      raX =  -1.75;
      raZ =   0.3 + Math.sin(t * 11) * 0.35;
      laX =  -0.15;

    } else if (anim === animationSet.action2) {
      // Dance
      const s = Math.sin(t * 7);
      laX = -0.9 + s * 0.7;
      raX = -0.9 - s * 0.7;
      llX =  s * 0.38;
      rlX = -s * 0.38;
      rootY = Math.abs(Math.sin(t * 7)) * 0.07;

    } else if (anim === animationSet.action3) {
      // Cheer — both arms high + bounce
      laX = -1.9; laZ = -0.4;
      raX = -1.9; raZ =  0.4;
      rootY = Math.abs(Math.sin(t * 9)) * 0.09;

    } else if (anim === animationSet.action4) {
      // Punch
      raX = -0.5 + Math.sin(t * 14) * 0.85;
      laX =  0.25;
    }

    // Apply lerped rotations / positions
    rootRef.current.position.y                = THREE.MathUtils.lerp(rootRef.current.position.y, rootY, lerp);
    bodyRef.current.rotation.x               = THREE.MathUtils.lerp(bodyRef.current.rotation.x, bodyX, lerp);
    headRef.current.rotation.x               = THREE.MathUtils.lerp(headRef.current.rotation.x, headX, lerp);
    leftArmRef.current.rotation.x            = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, laX, lerp);
    leftArmRef.current.rotation.z            = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, laZ, lerp);
    rightArmRef.current.rotation.x           = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, raX, lerp);
    rightArmRef.current.rotation.z           = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, raZ, lerp);
    leftLegRef.current.rotation.x            = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, llX, lerp);
    rightLegRef.current.rotation.x           = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, rlX, lerp);
  });

  return (
    <>
      {/* Head collider for camera avoidance */}
      <BallCollider args={[0.45]} position={[0, 0.5, 0]} />

      <group {...props} dispose={null}>
        {/* Root group — handles idle bob and jump squash */}
        <group ref={rootRef} scale={0.82} position={[0, -0.55, 0]}>

          {/* ── HEAD ── */}
          <group ref={headRef} position={[0, 1.08, 0]}>
            {/* Skull */}
            <mesh castShadow material={matBody}>
              <boxGeometry args={[0.62, 0.52, 0.48]} />
            </mesh>
            {/* Side ears */}
            <mesh castShadow position={[-0.36, 0, 0]} material={matPanel}>
              <boxGeometry args={[0.07, 0.28, 0.2]} />
            </mesh>
            <mesh castShadow position={[0.36, 0, 0]} material={matPanel}>
              <boxGeometry args={[0.07, 0.28, 0.2]} />
            </mesh>
            {/* Face recess */}
            <mesh position={[0, 0.02, 0.245]} material={matFace}>
              <boxGeometry args={[0.46, 0.36, 0.02]} />
            </mesh>
            {/* Eyes */}
            <mesh ref={eyeLRef} position={[-0.12, 0.06, 0.258]} material={matEye}>
              <boxGeometry args={[0.11, 0.09, 0.01]} />
            </mesh>
            <mesh ref={eyeRRef} position={[0.12, 0.06, 0.258]} material={matEye}>
              <boxGeometry args={[0.11, 0.09, 0.01]} />
            </mesh>
            {/* Mouth strip */}
            <mesh position={[0, -0.1, 0.258]} material={matMouth}>
              <boxGeometry args={[0.18, 0.025, 0.01]} />
            </mesh>
            {/* Antenna stem */}
            <mesh position={[0, 0.34, 0]} material={matPanel}>
              <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
            </mesh>
            {/* Antenna orb */}
            <mesh ref={antOrbRef} position={[0, 0.46, 0]} material={matOrb}>
              <sphereGeometry args={[0.065, 12, 12]} />
            </mesh>
            {/* Neck */}
            <mesh position={[0, -0.3, 0]} material={matJoint}>
              <cylinderGeometry args={[0.1, 0.12, 0.12, 10]} />
            </mesh>
          </group>

          {/* ── TORSO ── */}
          <group ref={bodyRef} position={[0, 0.08, 0]}>
            {/* Main body */}
            <mesh castShadow material={matBody}>
              <boxGeometry args={[0.68, 0.72, 0.44]} />
            </mesh>
            {/* Chest accent panel */}
            <mesh position={[0, 0.08, 0.225]} material={matAccent}>
              <boxGeometry args={[0.42, 0.38, 0.015]} />
            </mesh>
            {/* Horizontal belt line */}
            <mesh position={[0, -0.28, 0.225]} material={matJoint}>
              <boxGeometry args={[0.68, 0.04, 0.015]} />
            </mesh>

            {/* ── LEFT ARM (shoulder pivot) ── */}
            <group ref={leftArmRef} position={[-0.46, 0.28, 0]}>
              {/* Shoulder joint */}
              <mesh material={matJoint}>
                <sphereGeometry args={[0.1, 10, 10]} />
              </mesh>
              {/* Upper arm */}
              <mesh castShadow position={[0, -0.2, 0]} material={matPanel}>
                <boxGeometry args={[0.19, 0.38, 0.19]} />
              </mesh>
              {/* Elbow joint */}
              <mesh position={[0, -0.42, 0]} material={matJoint}>
                <sphereGeometry args={[0.075, 8, 8]} />
              </mesh>
              {/* Forearm */}
              <mesh castShadow position={[0, -0.6, 0]} material={matBody}>
                <boxGeometry args={[0.16, 0.32, 0.16]} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.82, 0]} material={matOrb}>
                <sphereGeometry args={[0.1, 10, 10]} />
              </mesh>
            </group>

            {/* ── RIGHT ARM (shoulder pivot) ── */}
            <group ref={rightArmRef} position={[0.46, 0.28, 0]}>
              <mesh material={matJoint}>
                <sphereGeometry args={[0.1, 10, 10]} />
              </mesh>
              <mesh castShadow position={[0, -0.2, 0]} material={matPanel}>
                <boxGeometry args={[0.19, 0.38, 0.19]} />
              </mesh>
              <mesh position={[0, -0.42, 0]} material={matJoint}>
                <sphereGeometry args={[0.075, 8, 8]} />
              </mesh>
              <mesh castShadow position={[0, -0.6, 0]} material={matBody}>
                <boxGeometry args={[0.16, 0.32, 0.16]} />
              </mesh>
              <mesh position={[0, -0.82, 0]} material={matOrb}>
                <sphereGeometry args={[0.1, 10, 10]} />
              </mesh>
            </group>
          </group>

          {/* ── LEFT LEG (hip pivot) ── */}
          <group ref={leftLegRef} position={[-0.2, -0.38, 0]}>
            {/* Hip joint */}
            <mesh material={matJoint}>
              <sphereGeometry args={[0.095, 8, 8]} />
            </mesh>
            {/* Thigh */}
            <mesh castShadow position={[0, -0.22, 0]} material={matPanel}>
              <boxGeometry args={[0.21, 0.4, 0.21]} />
            </mesh>
            {/* Knee */}
            <mesh position={[0, -0.45, 0]} material={matJoint}>
              <sphereGeometry args={[0.075, 8, 8]} />
            </mesh>
            {/* Shin */}
            <mesh castShadow position={[0, -0.63, 0]} material={matBody}>
              <boxGeometry args={[0.18, 0.32, 0.18]} />
            </mesh>
            {/* Foot */}
            <mesh castShadow position={[0, -0.86, 0.06]} material={matPanel}>
              <boxGeometry args={[0.24, 0.1, 0.32]} />
            </mesh>
          </group>

          {/* ── RIGHT LEG (hip pivot) ── */}
          <group ref={rightLegRef} position={[0.2, -0.38, 0]}>
            <mesh material={matJoint}>
              <sphereGeometry args={[0.095, 8, 8]} />
            </mesh>
            <mesh castShadow position={[0, -0.22, 0]} material={matPanel}>
              <boxGeometry args={[0.21, 0.4, 0.21]} />
            </mesh>
            <mesh position={[0, -0.45, 0]} material={matJoint}>
              <sphereGeometry args={[0.075, 8, 8]} />
            </mesh>
            <mesh castShadow position={[0, -0.63, 0]} material={matBody}>
              <boxGeometry args={[0.18, 0.32, 0.18]} />
            </mesh>
            <mesh castShadow position={[0, -0.86, 0.06]} material={matPanel}>
              <boxGeometry args={[0.24, 0.1, 0.32]} />
            </mesh>
          </group>

        </group>
      </group>
    </>
  );
}
