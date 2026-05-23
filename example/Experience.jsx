import { Sky, KeyboardControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Ecctrl from "../src/Ecctrl";
import Floor from "./Floor";
import Lights from "./Lights";
import Steps from "./Steps";
import Slopes from "./Slopes";
import RoughPlane from "./RoughPlane";
import FloatingPlatform from "./FloatingPlatform";
import DynamicPlatforms from "./DynamicPlatforms";
import LearningZone from "./LearningZone";
import SmartbookBridge from "./SmartbookBridge";
import FloatingNPC from "./FloatingNPC";
import WorldDecorations from "./WorldDecorations";
import { useControls } from "leva";
import RobotCharacter from "./RobotCharacter";
import React, { useEffect, useState } from "react";

export default function Experience() {
  const [pausedPhysics, setPausedPhysics] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => setPausedPhysics(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  const { physics, disableControl, disableFollowCam } = useControls("World Settings", {
    physics: false,
    disableControl: false,
    disableFollowCam: false,
  });

  const keyboardMap = [
    { name: "forward",   keys: ["ArrowUp",    "KeyW"] },
    { name: "backward",  keys: ["ArrowDown",   "KeyS"] },
    { name: "leftward",  keys: ["ArrowLeft",   "KeyA"] },
    { name: "rightward", keys: ["ArrowRight",  "KeyD"] },
    { name: "jump",      keys: ["Space"] },
    { name: "run",       keys: ["Shift"] },
    { name: "action1",   keys: ["1"] },
    { name: "action2",   keys: ["2"] },
    { name: "action3",   keys: ["3"] },
    { name: "action4",   keys: ["KeyF"] },
  ];

  return (
    <>
      <color attach="background" args={["#a8d0ee"]} />
      <fog attach="fog" args={["#c0dff5", 60, 180]} />
      <Sky sunPosition={[100, 30, 100]} />

      <Lights />
      <SmartbookBridge />

      <Physics debug={physics} timeStep="vary" paused={pausedPhysics}>
        <KeyboardControls map={keyboardMap}>
          <Ecctrl
            animated
            followLight
            springK={2}
            dampingC={0.2}
            autoBalanceSpringK={1.2}
            autoBalanceDampingC={0.04}
            autoBalanceSpringOnY={0.7}
            autoBalanceDampingOnY={0.05}
            disableControl={disableControl}
            disableFollowCam={disableFollowCam}
          >
            <RobotCharacter />
          </Ecctrl>
        </KeyboardControls>

        <RoughPlane />
        <Slopes />
        <Steps />
        <FloatingPlatform />
        <DynamicPlatforms />
        <Floor />

        {/* ── Smartbook Learning Zones ── */}
        <LearningZone zoneId="math"    position={[19,  -1,  6]} />
        <LearningZone zoneId="science" position={[-17, -1, -9]} />
        <LearningZone zoneId="reading" position={[5,   -1, 21]} />
        <LearningZone zoneId="history" position={[-8,  -1,-20]} />
      </Physics>

      {/* ── World decorations (trees, rocks, path stones) ── */}
      <WorldDecorations />

      {/* ── Floating NPC characters ── */}

      {/* Math zone — blue, 2 NPCs */}
      <FloatingNPC center={[19, 0, 6]}  color="#4f9cf9" orbitRadius={5.5} orbitSpeed={0.22} phase={0}    floatHeight={2.2} />
      <FloatingNPC center={[19, 0, 6]}  color="#4f9cf9" orbitRadius={4.0} orbitSpeed={0.18} phase={2.1}  floatHeight={1.7} bodyScale={0.78} />

      {/* Science zone — green, 2 NPCs */}
      <FloatingNPC center={[-17, 0, -9]} color="#4ecb71" orbitRadius={5.0} orbitSpeed={0.25} phase={1.2}  floatHeight={2.0} />
      <FloatingNPC center={[-17, 0, -9]} color="#4ecb71" orbitRadius={3.5} orbitSpeed={0.20} phase={3.8}  floatHeight={2.5} bodyScale={0.82} />

      {/* Reading zone — orange, 2 NPCs */}
      <FloatingNPC center={[5, 0, 21]}  color="#f9a14f" orbitRadius={5.5} orbitSpeed={0.20} phase={0.7}  floatHeight={1.9} />
      <FloatingNPC center={[5, 0, 21]}  color="#f9a14f" orbitRadius={4.2} orbitSpeed={0.26} phase={4.5}  floatHeight={2.4} bodyScale={0.75} />

      {/* History zone — purple, 2 NPCs */}
      <FloatingNPC center={[-8, 0, -20]} color="#c47af9" orbitRadius={5.0} orbitSpeed={0.23} phase={2.8}  floatHeight={2.1} />
      <FloatingNPC center={[-8, 0, -20]} color="#c47af9" orbitRadius={3.8} orbitSpeed={0.19} phase={0.4}  floatHeight={1.8} bodyScale={0.80} />

      {/* Free-roaming — silver, wide lazy orbits */}
      <FloatingNPC center={[0, 0, 0]}   color="#c8d8f8" orbitRadius={10}  orbitSpeed={0.10} phase={0}    floatHeight={2.3} bodyScale={0.88} />
      <FloatingNPC center={[3, 0, 8]}   color="#c8d8f8" orbitRadius={8}   orbitSpeed={0.08} phase={3.1}  floatHeight={2.0} bodyScale={0.70} />
    </>
  );
}
