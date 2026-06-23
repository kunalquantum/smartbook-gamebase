import { KeyboardControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Ecctrl from "../src/Ecctrl";
import Floor from "./Floor";
import DayNight from "./DayNight";
import Steps from "./Steps";
import Slopes from "./Slopes";
import RoughPlane from "./RoughPlane";
import FloatingPlatform from "./FloatingPlatform";
import DynamicPlatforms from "./DynamicPlatforms";
import LearningZone from "./LearningZone";
import NewtonsWorldLab from "./NewtonsWorldLab";
import OpticsLab from "./OpticsLab";
import OhmsLawLab from "./OhmsLawLab";
import WavesLab from "./WavesLab";
import EnergyLab from "./EnergyLab";
import SmartbookBridge from "./SmartbookBridge";
import FloatingNPC from "./FloatingNPC";
import WorldDecorations from "./WorldDecorations";
import Animals from "./Animals";
import Clouds from "./Clouds";
import Fireflies from "./Fireflies";
import Pond from "./Pond";
import PostProcessing from "./PostProcessing";
import { useControls } from "leva";
import RobotCharacter from "./RobotCharacter";
import React, { useEffect, useState } from "react";

export default function Experience() {
  const [pausedPhysics, setPausedPhysics] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => setPausedPhysics(false), 1200);
    return () => clearTimeout(timeout);
  }, []);

  const { physics, disableControl, disableFollowCam } = useControls("World Settings", {
    physics: false,
    disableControl: false,
    disableFollowCam: false,
  });

  const keyboardMap = [
    { name: "forward",   keys: ["ArrowUp",   "KeyW"] },
    { name: "backward",  keys: ["ArrowDown",  "KeyS"] },
    { name: "leftward",  keys: ["ArrowLeft",  "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump",      keys: ["Space"] },
    { name: "run",       keys: ["Shift"] },
    { name: "action1",   keys: ["1"] },
    { name: "action2",   keys: ["2"] },
    { name: "action3",   keys: ["3"] },
    { name: "action4",   keys: ["KeyF"] },
  ];

  return (
    <>
      {/* ── Atmosphere ── */}
      <color attach="background" args={["#a8d0ee"]} />
      <fog attach="fog" args={["#c0dff5", 60, 190]} />
      <DayNight />

      {/* ── Post-processing (Bloom + Vignette) ── */}
      <PostProcessing />

      {/* ── Physics world ── */}
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

        {/* ── Learning Zones — every zone is now a live physics lab ── */}
        <LearningZone zoneId="newton" position={[-17, -1, -9]} />
        <NewtonsWorldLab position={[-17, -1, -9]} />

        <LearningZone zoneId="optics" position={[19, -1, 6]} />
        <OpticsLab position={[19, -1, 6]} />

        <LearningZone zoneId="ohms" position={[5, -1, 21]} />
        <OhmsLawLab position={[5, -1, 21]} />

        <LearningZone zoneId="waves" position={[-8, -1, -20]} />
        <WavesLab position={[-8, -1, -20]} />

        <LearningZone zoneId="energy" position={[22, -1, -16]} />
        <EnergyLab position={[22, -1, -16]} />
      </Physics>

      {/* ── Smartbook state bridge ── */}
      <SmartbookBridge />

      {/* ── Sky things ── */}
      <Clouds />

      {/* ── Ground life ── */}
      <Pond />
      <Fireflies />
      <WorldDecorations />
      <Animals />

      {/* ── Floating NPC characters — one guide per lab, kept minimal ── */}
      <FloatingNPC center={[-17, 0, -9]} color="#4ecb71" orbitRadius={5.0} orbitSpeed={0.25} phase={1.2} floatHeight={2.0} />
      <FloatingNPC center={[19, 0, 6]}   color="#4f9cf9" orbitRadius={5.5} orbitSpeed={0.22} phase={0}   floatHeight={2.2} />
      <FloatingNPC center={[5, 0, 21]}   color="#f9a14f" orbitRadius={5.5} orbitSpeed={0.20} phase={0.7} floatHeight={1.9} />
      <FloatingNPC center={[-8, 0, -20]} color="#5fd0e0" orbitRadius={5.0} orbitSpeed={0.23} phase={2.8} floatHeight={2.1} />
      <FloatingNPC center={[22, 0, -16]} color="#c47af9" orbitRadius={5.0} orbitSpeed={0.21} phase={1.7} floatHeight={2.0} />
    </>
  );
}
