import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Helpers ───────────────────────────────────────────────────────────────

function mat(color, roughness = 0.82, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

const M = {
  nose:       mat("#1a0808"),
  eye:        mat("#111"),
  innerEar:   mat("#f0b8b0"),
  beak:       mat("#e8a030"),
  birdBody:   mat("#5a7840"),
  birdWing:   mat("#4a6830"),
  birdChest:  mat("#d05030"),
};

// Lerp helper
const lerp = THREE.MathUtils.lerp;

// ── DOG ──────────────────────────────────────────────────────────────────

function Dog({ waypoints, color = "#c8956c", speed = 1.6, phase = 0, scale = 1 }) {
  const rootRef = useRef();
  const legFLRef = useRef();
  const legFRRef = useRef();
  const legBLRef = useRef();
  const legBRRef = useRef();
  const tailRef  = useRef();
  const headRef  = useRef();

  const idx   = useRef(0);
  const pos   = useRef(new THREE.Vector3(waypoints[0][0], -1, waypoints[0][2]));
  const angle = useRef(0);
  const tmp   = useMemo(() => new THREE.Vector3(), []);
  const body  = useMemo(() => mat(color), [color]);
  const darkFur = useMemo(() => mat(new THREE.Color(color).multiplyScalar(0.72).getStyle()), [color]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + phase;
    if (!rootRef.current) return;

    // ── Walk toward waypoint ──
    const wp = waypoints[idx.current];
    tmp.set(wp[0], -1, wp[2]);
    const dist = pos.current.distanceTo(tmp);

    if (dist < 0.6) {
      idx.current = (idx.current + 1) % waypoints.length;
    } else {
      const step = tmp.clone().sub(pos.current).normalize().multiplyScalar(speed * delta);
      pos.current.add(step);
      angle.current = Math.atan2(wp[0] - pos.current.x, wp[2] - pos.current.z);
    }

    rootRef.current.position.copy(pos.current);
    rootRef.current.rotation.y = lerp(rootRef.current.rotation.y, angle.current, delta * 6);

    // ── Leg swing ──
    const swing = Math.sin(t * speed * 4) * 0.55;
    if (legFLRef.current) legFLRef.current.rotation.x = swing;
    if (legBRRef.current) legBRRef.current.rotation.x = swing;
    if (legFRRef.current) legFRRef.current.rotation.x = -swing;
    if (legBLRef.current) legBLRef.current.rotation.x = -swing;

    // ── Tail wag ──
    if (tailRef.current) tailRef.current.rotation.y = Math.sin(t * 7) * 0.7;

    // ── Head bob ──
    if (headRef.current) headRef.current.position.y = 0.52 + Math.abs(Math.sin(t * speed * 4)) * 0.02;
  });

  return (
    <group ref={rootRef} scale={scale}>
      {/* Body */}
      <mesh castShadow receiveShadow material={body} position={[0, 0.3, 0]}>
        <boxGeometry args={[0.52, 0.26, 0.68]} />
      </mesh>
      {/* Belly patch */}
      <mesh material={darkFur} position={[0, 0.22, 0]}>
        <boxGeometry args={[0.3, 0.08, 0.5]} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 0.52, -0.36]}>
        <mesh castShadow material={body}>
          <boxGeometry args={[0.34, 0.3, 0.3]} />
        </mesh>
        {/* Snout */}
        <mesh castShadow material={body} position={[0, -0.04, -0.18]}>
          <boxGeometry args={[0.2, 0.14, 0.16]} />
        </mesh>
        {/* Nose */}
        <mesh material={M.nose} position={[0, -0.01, -0.27]}>
          <boxGeometry args={[0.1, 0.07, 0.02]} />
        </mesh>
        {/* Eyes */}
        <mesh material={M.eye} position={[-0.1, 0.07, -0.16]}>
          <sphereGeometry args={[0.04, 6, 6]} />
        </mesh>
        <mesh material={M.eye} position={[0.1, 0.07, -0.16]}>
          <sphereGeometry args={[0.04, 6, 6]} />
        </mesh>
        {/* Floppy ears */}
        <mesh castShadow material={darkFur} position={[-0.2, 0.04, 0.04]} rotation={[0, 0, 0.28]}>
          <boxGeometry args={[0.1, 0.22, 0.08]} />
        </mesh>
        <mesh castShadow material={darkFur} position={[0.2, 0.04, 0.04]} rotation={[0, 0, -0.28]}>
          <boxGeometry args={[0.1, 0.22, 0.08]} />
        </mesh>
      </group>

      {/* Tail */}
      <group ref={tailRef} position={[0, 0.38, 0.35]}>
        <mesh castShadow material={body} rotation={[-0.7, 0, 0]} position={[0, 0.14, 0.04]}>
          <cylinderGeometry args={[0.04, 0.02, 0.3, 6]} />
        </mesh>
      </group>

      {/* Legs — pivot at hip */}
      <group ref={legFLRef} position={[-0.2, 0.28, -0.24]}>
        <mesh castShadow material={body} position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.055, 0.042, 0.3, 7]} />
        </mesh>
        {/* Paw */}
        <mesh material={darkFur} position={[0, -0.32, 0.02]} scale={[1.1, 0.5, 1.3]}>
          <sphereGeometry args={[0.06, 6, 5]} />
        </mesh>
      </group>
      <group ref={legFRRef} position={[0.2, 0.28, -0.24]}>
        <mesh castShadow material={body} position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.055, 0.042, 0.3, 7]} />
        </mesh>
        <mesh material={darkFur} position={[0, -0.32, 0.02]} scale={[1.1, 0.5, 1.3]}>
          <sphereGeometry args={[0.06, 6, 5]} />
        </mesh>
      </group>
      <group ref={legBLRef} position={[-0.2, 0.28, 0.22]}>
        <mesh castShadow material={body} position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.055, 0.042, 0.3, 7]} />
        </mesh>
        <mesh material={darkFur} position={[0, -0.32, 0.02]} scale={[1.1, 0.5, 1.3]}>
          <sphereGeometry args={[0.06, 6, 5]} />
        </mesh>
      </group>
      <group ref={legBRRef} position={[0.2, 0.28, 0.22]}>
        <mesh castShadow material={body} position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.055, 0.042, 0.3, 7]} />
        </mesh>
        <mesh material={darkFur} position={[0, -0.32, 0.02]} scale={[1.1, 0.5, 1.3]}>
          <sphereGeometry args={[0.06, 6, 5]} />
        </mesh>
      </group>
    </group>
  );
}

// ── CAT ──────────────────────────────────────────────────────────────────

function Cat({ waypoints, color = "#e07830", speed = 1.1, phase = 0, scale = 1 }) {
  const rootRef  = useRef();
  const legFLRef = useRef();
  const legFRRef = useRef();
  const legBLRef = useRef();
  const legBRRef = useRef();
  const tailRef  = useRef();
  const headRef  = useRef();

  const idx   = useRef(0);
  const pos   = useRef(new THREE.Vector3(waypoints[0][0], -1, waypoints[0][2]));
  const angle = useRef(0);
  const tmp   = useMemo(() => new THREE.Vector3(), []);
  const body  = useMemo(() => mat(color), [color]);
  const light = useMemo(() => mat(new THREE.Color(color).lerp(new THREE.Color("#fff"), 0.35).getStyle()), [color]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + phase;
    if (!rootRef.current) return;

    const wp = waypoints[idx.current];
    tmp.set(wp[0], -1, wp[2]);
    const dist = pos.current.distanceTo(tmp);

    if (dist < 0.5) {
      idx.current = (idx.current + 1) % waypoints.length;
    } else {
      pos.current.add(tmp.clone().sub(pos.current).normalize().multiplyScalar(speed * delta));
      angle.current = Math.atan2(wp[0] - pos.current.x, wp[2] - pos.current.z);
    }

    rootRef.current.position.copy(pos.current);
    rootRef.current.rotation.y = lerp(rootRef.current.rotation.y, angle.current, delta * 5);

    const swing = Math.sin(t * speed * 4.5) * 0.45;
    if (legFLRef.current) legFLRef.current.rotation.x =  swing;
    if (legBRRef.current) legBRRef.current.rotation.x =  swing;
    if (legFRRef.current) legFRRef.current.rotation.x = -swing;
    if (legBLRef.current) legBLRef.current.rotation.x = -swing;

    // Tail sways gracefully
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 1.8) * 0.5;
      tailRef.current.rotation.z = Math.sin(t * 1.2) * 0.25;
    }
    // Head tilts slightly as they walk
    if (headRef.current) headRef.current.rotation.z = Math.sin(t * speed * 4.5) * 0.06;
  });

  return (
    <group ref={rootRef} scale={scale}>
      {/* Sleek body */}
      <mesh castShadow receiveShadow material={body} position={[0, 0.26, 0]} scale={[1, 1, 1.15]}>
        <boxGeometry args={[0.38, 0.22, 0.62]} />
      </mesh>
      {/* Chest/belly — lighter */}
      <mesh material={light} position={[0, 0.22, -0.15]}>
        <boxGeometry args={[0.22, 0.12, 0.22]} />
      </mesh>

      {/* Head — rounder than dog */}
      <group ref={headRef} position={[0, 0.46, -0.34]}>
        <mesh castShadow material={body} scale={[1, 0.95, 0.95]}>
          <sphereGeometry args={[0.18, 10, 8]} />
        </mesh>
        {/* Pointed ears */}
        <mesh castShadow material={body} position={[-0.12, 0.18, 0]} rotation={[0, 0, 0.25]}>
          <coneGeometry args={[0.07, 0.2, 5]} />
        </mesh>
        <mesh castShadow material={body} position={[0.12, 0.18, 0]} rotation={[0, 0, -0.25]}>
          <coneGeometry args={[0.07, 0.2, 5]} />
        </mesh>
        {/* Inner ear */}
        <mesh material={M.innerEar} position={[-0.12, 0.18, 0.04]} rotation={[0, 0, 0.25]} scale={0.6}>
          <coneGeometry args={[0.07, 0.2, 5]} />
        </mesh>
        <mesh material={M.innerEar} position={[0.12, 0.18, 0.04]} rotation={[0, 0, -0.25]} scale={0.6}>
          <coneGeometry args={[0.07, 0.2, 5]} />
        </mesh>
        {/* Eyes — slightly bigger for cute factor */}
        <mesh material={M.eye} position={[-0.08, 0.03, -0.15]}>
          <sphereGeometry args={[0.045, 8, 8]} />
        </mesh>
        <mesh material={M.eye} position={[0.08, 0.03, -0.15]}>
          <sphereGeometry args={[0.045, 8, 8]} />
        </mesh>
        {/* Nose */}
        <mesh material={M.innerEar} position={[0, -0.04, -0.18]}>
          <boxGeometry args={[0.05, 0.03, 0.01]} />
        </mesh>
      </group>

      {/* Elegant curved tail */}
      <group ref={tailRef} position={[0, 0.32, 0.32]}>
        <mesh castShadow material={body} rotation={[-0.5, 0, 0]} position={[0, 0.18, 0.08]}>
          <cylinderGeometry args={[0.03, 0.02, 0.42, 6]} />
        </mesh>
        {/* Tail tip */}
        <mesh castShadow material={light} rotation={[-0.5, 0, 0]} position={[0, 0.38, 0.16]}>
          <sphereGeometry args={[0.04, 6, 6]} />
        </mesh>
      </group>

      {/* Legs */}
      {[
        { ref: legFLRef, p: [-0.15, 0.22, -0.22] },
        { ref: legFRRef, p: [ 0.15, 0.22, -0.22] },
        { ref: legBLRef, p: [-0.15, 0.22,  0.2 ] },
        { ref: legBRRef, p: [ 0.15, 0.22,  0.2 ] },
      ].map(({ ref, p }, i) => (
        <group ref={ref} position={p} key={i}>
          <mesh castShadow material={body} position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.042, 0.032, 0.26, 6]} />
          </mesh>
          <mesh material={light} position={[0, -0.27, 0.02]} scale={[1, 0.5, 1.2]}>
            <sphereGeometry args={[0.055, 6, 5]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── BIRD FLOCK ────────────────────────────────────────────────────────────

function Bird({ offset, speed, phase }) {
  const ref      = useRef();
  const wingLRef = useRef();
  const wingRRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    if (!ref.current) return;

    // Flock arc — large sweeping circle over the map
    const r = 28 + offset[2] * 4;
    ref.current.position.x = Math.cos(t * 0.18) * r + offset[0] * 3;
    ref.current.position.y = 10 + offset[1] * 2 + Math.sin(t * 0.9) * 1.2;
    ref.current.position.z = Math.sin(t * 0.18) * r + offset[2] * 3;

    // Face direction of travel
    ref.current.rotation.y = -(t * 0.18) + Math.PI / 2;

    // Wing flap
    const flap = Math.sin(t * 6) * 0.7;
    if (wingLRef.current) wingLRef.current.rotation.z = -flap;
    if (wingRRef.current) wingRRef.current.rotation.z =  flap;
  });

  return (
    <group ref={ref} scale={0.22}>
      {/* Body */}
      <mesh castShadow material={M.birdBody} scale={[1, 0.7, 1.4]}>
        <sphereGeometry args={[0.5, 8, 7]} />
      </mesh>
      {/* Red chest */}
      <mesh material={M.birdChest} position={[0, -0.1, -0.4]} scale={[0.7, 0.6, 0.7]}>
        <sphereGeometry args={[0.4, 6, 6]} />
      </mesh>
      {/* Beak */}
      <mesh material={M.beak} position={[0, 0, -0.75]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.12, 0.4, 5]} />
      </mesh>
      {/* Eyes */}
      <mesh material={M.eye} position={[-0.28, 0.12, -0.3]}>
        <sphereGeometry args={[0.1, 6, 6]} />
      </mesh>
      <mesh material={M.eye} position={[0.28, 0.12, -0.3]}>
        <sphereGeometry args={[0.1, 6, 6]} />
      </mesh>
      {/* Wings */}
      <group ref={wingLRef} position={[-0.5, 0, 0]}>
        <mesh castShadow material={M.birdWing} rotation={[0, 0.2, 0]} position={[-0.5, 0, 0]}>
          <boxGeometry args={[1.0, 0.08, 0.5]} />
        </mesh>
      </group>
      <group ref={wingRRef} position={[0.5, 0, 0]}>
        <mesh castShadow material={M.birdWing} rotation={[0, -0.2, 0]} position={[0.5, 0, 0]}>
          <boxGeometry args={[1.0, 0.08, 0.5]} />
        </mesh>
      </group>
      {/* Tail */}
      <mesh material={M.birdWing} position={[0, 0, 0.6]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.4, 0.06, 0.4]} />
      </mesh>
    </group>
  );
}

// ── ANIMALS SCENE ─────────────────────────────────────────────────────────

export default function Animals() {
  return (
    <group>

      {/* ── DOGS ── */}
      <Dog
        color="#c8956c"
        speed={1.7}
        phase={0}
        waypoints={[
          [ 3, -1, -2], [ 7, -1,  3], [ 4, -1,  9],
          [-1, -1,  6], [-3, -1,  1], [ 0, -1, -3],
        ]}
      />
      <Dog
        color="#7a4a28"
        speed={1.5}
        phase={2.4}
        scale={1.1}
        waypoints={[
          [10, -1, -4], [14, -1,  1], [12, -1,  7],
          [ 7, -1,  4], [ 5, -1, -2],
        ]}
      />
      <Dog
        color="#e8d8b8"
        speed={1.9}
        phase={4.8}
        scale={0.88}
        waypoints={[
          [-5, -1,  4], [-9, -1,  0], [-7, -1, -4],
          [-2, -1, -3], [ 1, -1,  2],
        ]}
      />

      {/* ── CATS ── */}
      <Cat
        color="#e07830"
        speed={1.0}
        phase={1.5}
        waypoints={[
          [ 2, -1, -5], [ 6, -1, -7], [ 9, -1, -4],
          [ 5, -1, -1], [ 1, -1, -2],
        ]}
      />
      <Cat
        color="#9a9a9a"
        speed={0.9}
        phase={3.8}
        scale={0.92}
        waypoints={[
          [-7, -1, 5], [-10, -1, 1], [-8, -1, -3],
          [-4, -1,  0], [-5, -1,  4],
        ]}
      />

      {/* ── BIRD FLOCK (8 birds) ── */}
      {Array.from({ length: 8 }, (_, i) => (
        <Bird
          key={i}
          speed={1 + i * 0.06}
          phase={i * 0.78}
          offset={[
            Math.sin(i * 1.2) * 1.4,
            Math.cos(i * 0.9) * 0.8,
            Math.cos(i * 1.5) * 1.2,
          ]}
        />
      ))}

    </group>
  );
}
