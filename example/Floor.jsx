import { useMemo } from "react";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

function makeGrassTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Base coat
  ctx.fillStyle = "#4a7a3c";
  ctx.fillRect(0, 0, size, size);

  // Colour variation patches
  for (let i = 0; i < 280; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const rx = 6  + Math.random() * 22;
    const ry = 4  + Math.random() * 14;
    const hue   = 95  + Math.random() * 35;
    const light = 22  + Math.random() * 18;
    ctx.fillStyle = `hsl(${hue},52%,${light}%)`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Individual grass blades
  for (let i = 0; i < 5000; i++) {
    const x   = Math.random() * size;
    const y   = Math.random() * size;
    const h   = 2 + Math.random() * 7;
    const hue = 100 + Math.random() * 28;
    const lit = 26  + Math.random() * 20;
    ctx.strokeStyle = `hsl(${hue},54%,${lit}%)`;
    ctx.lineWidth   = 0.3 + Math.random() * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, y - h);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS  = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(55, 55);
  return tex;
}

export default function Floor() {
  const grassTex = useMemo(() => {
    try { return makeGrassTexture(); } catch { return null; }
  }, []);

  return (
    <RigidBody type="fixed">
      <mesh receiveShadow position={[0, -3.5, 0]}>
        <boxGeometry args={[300, 5, 300]} />
        <meshStandardMaterial
          map={grassTex || undefined}
          color="#4a7c3f"
          roughness={0.92}
          metalness={0}
        />
      </mesh>
    </RigidBody>
  );
}
