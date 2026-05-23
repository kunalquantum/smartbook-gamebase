import * as THREE from "three";

// ── Shared materials ────────────────────────────────────────────────────────
const matTrunk  = new THREE.MeshStandardMaterial({ color: "#5c3d1e", roughness: 0.9 });
const matLeafA  = new THREE.MeshStandardMaterial({ color: "#3a7030", roughness: 0.85 });
const matLeafB  = new THREE.MeshStandardMaterial({ color: "#4a8c3f", roughness: 0.85 });
const matLeafC  = new THREE.MeshStandardMaterial({ color: "#5aab4a", roughness: 0.85 });
const matRockA  = new THREE.MeshStandardMaterial({ color: "#7a8a8a", roughness: 0.92, metalness: 0.05 });
const matRockB  = new THREE.MeshStandardMaterial({ color: "#6a7878", roughness: 0.95, metalness: 0.05 });
const matStone  = new THREE.MeshStandardMaterial({ color: "#9aaba8", roughness: 0.88 });

// ── Sub-components ──────────────────────────────────────────────────────────
function Tree({ position, height = 1.6, crownR = 0.85, leafMat = matLeafA, r = 0 }) {
  return (
    <group position={position} rotation={[0, r, 0]}>
      {/* Trunk */}
      <mesh castShadow receiveShadow material={matTrunk}
        position={[0, height * 0.5 - 1, 0]}>
        <cylinderGeometry args={[0.1, 0.17, height, 7]} />
      </mesh>
      {/* Lower crown */}
      <mesh castShadow material={leafMat} position={[0, height - 0.9, 0]}>
        <sphereGeometry args={[crownR, 8, 6]} />
      </mesh>
      {/* Upper crown — slightly different green, smaller */}
      <mesh castShadow material={crownR > 0.8 ? matLeafB : matLeafC}
        position={[0.08, height - 0.3, 0.06]} scale={0.72}>
        <sphereGeometry args={[crownR, 7, 5]} />
      </mesh>
      {/* Top tuft */}
      <mesh castShadow material={matLeafC} position={[-0.05, height + 0.28, -0.04]} scale={0.45}>
        <sphereGeometry args={[crownR, 6, 5]} />
      </mesh>
    </group>
  );
}

function Rock({ position, s = 1, r = [0, 0, 0], mat = matRockA }) {
  return (
    <mesh castShadow receiveShadow material={mat}
      position={position} rotation={r} scale={s}>
      <icosahedronGeometry args={[0.38, 0]} />
    </mesh>
  );
}

// Flat stone disc — path / stepping stone
function Stone({ position, r = 0 }) {
  return (
    <mesh receiveShadow material={matStone}
      position={position} rotation={[-Math.PI / 2, 0, r]}>
      <cylinderGeometry args={[0.38, 0.42, 0.07, 8]} />
    </mesh>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function WorldDecorations() {
  return (
    <group>

      {/* ── TREES ─────────────────────────────────────────────────── */}

      {/* Cluster near spawn */}
      <Tree position={[ 8,   -1,  -5]} height={1.8} crownR={0.9}  leafMat={matLeafA} r={0.4} />
      <Tree position={[11,   -1,  -3]} height={1.5} crownR={0.75} leafMat={matLeafB} r={1.1} />
      <Tree position={[-6,   -1,   4]} height={2.0} crownR={1.0}  leafMat={matLeafA} r={2.2} />
      <Tree position={[-9,   -1,   2]} height={1.6} crownR={0.8}  leafMat={matLeafC} r={0.9} />
      <Tree position={[ 3,   -1,  -7]} height={1.7} crownR={0.85} leafMat={matLeafB} r={1.8} />
      <Tree position={[-3,   -1,  -5]} height={1.4} crownR={0.7}  leafMat={matLeafC} r={3.1} />

      {/* Path toward Math zone */}
      <Tree position={[13,   -1,  -2]} height={1.9} crownR={0.9}  leafMat={matLeafA} r={0.7} />
      <Tree position={[14,   -1,   9]} height={1.6} crownR={0.8}  leafMat={matLeafB} r={2.0} />

      {/* Path toward Reading zone */}
      <Tree position={[-4,   -1,  15]} height={2.1} crownR={1.05} leafMat={matLeafA} r={1.3} />
      <Tree position={[ 9,   -1,  16]} height={1.7} crownR={0.85} leafMat={matLeafC} r={2.5} />
      <Tree position={[13,   -1,  17]} height={1.5} crownR={0.75} leafMat={matLeafB} r={0.2} />

      {/* Path toward Science zone */}
      <Tree position={[-13,  -1,  -2]} height={2.0} crownR={1.0}  leafMat={matLeafA} r={1.6} />
      <Tree position={[-11,  -1,  -6]} height={1.6} crownR={0.8}  leafMat={matLeafC} r={0.5} />

      {/* Path toward History zone */}
      <Tree position={[-5,   -1, -13]} height={1.8} crownR={0.9}  leafMat={matLeafB} r={2.8} />
      <Tree position={[-10,  -1, -15]} height={1.5} crownR={0.75} leafMat={matLeafA} r={1.0} />
      <Tree position={[ 3,   -1, -14]} height={1.7} crownR={0.85} leafMat={matLeafC} r={3.5} />

      {/* ── ROCKS ─────────────────────────────────────────────────── */}

      {/* Near slopes (west terrain) */}
      <Rock position={[-8,  -1,  14]} s={1.1} r={[0.3, 1.2, 0.1]} />
      <Rock position={[-12, -1,   9]} s={0.8} r={[0.1, 0.8, 0.4]} mat={matRockB} />
      <Rock position={[-14, -1,  12]} s={1.3} r={[0.5, 0.3, 0.2]} />

      {/* Near rough plane (east terrain) */}
      <Rock position={[12,  -1,  12]} s={1.2} r={[0.2, 1.5, 0.3]} mat={matRockB} />
      <Rock position={[ 8,  -1,  15]} s={0.9} r={[0.4, 0.6, 0.1]} />
      <Rock position={[15,  -1,   9]} s={1.0} r={[0.1, 2.1, 0.5]} mat={matRockB} />

      {/* Scattered field rocks */}
      <Rock position={[ 5,  -1,  -9]} s={0.7} r={[0.3, 1.0, 0.2]} />
      <Rock position={[-8,  -1,  -4]} s={0.9} r={[0.1, 0.4, 0.3]} mat={matRockB} />
      <Rock position={[10,  -1,  -9]} s={0.6} r={[0.5, 1.8, 0.1]} />
      <Rock position={[-4,  -1, -10]} s={1.1} r={[0.2, 2.4, 0.4]} />

      {/* ── STONE PATH MARKERS ────────────────────────────────────── */}

      {/* Toward Math */}
      <Stone position={[ 6,  -0.98,  2]}  r={0.3} />
      <Stone position={[10,  -0.98,  3]}  r={1.1} />
      <Stone position={[14,  -0.98,  4]}  r={0.7} />

      {/* Toward Reading */}
      <Stone position={[ 3,  -0.98,  7]}  r={0.5} />
      <Stone position={[ 4,  -0.98, 13]}  r={1.8} />

      {/* Toward Science */}
      <Stone position={[-6,  -0.98, -2]}  r={0.9} />
      <Stone position={[-11, -0.98, -5]}  r={2.1} />

      {/* Toward History */}
      <Stone position={[-3,  -0.98, -8]}  r={1.4} />
      <Stone position={[-6,  -0.98,-14]}  r={0.6} />

    </group>
  );
}
