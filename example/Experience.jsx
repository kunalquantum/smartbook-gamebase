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
    </>
  );
}
