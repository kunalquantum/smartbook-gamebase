import { useEffect, useRef } from "react";
import { useSmartbook } from "../src/stores/useSmartbook";
import { useGame } from "../src/stores/useGame";

// Lives inside the Canvas — bridges smartbook lesson state → character animations.
export default function SmartbookBridge() {
  const activeLessonPanel = useSmartbook((s) => s.activeLessonPanel);
  const completedZones = useSmartbook((s) => s.completedZones);
  const action1 = useGame((s) => s.action1); // Wave — greeting/reading
  const action3 = useGame((s) => s.action3); // Cheer — celebration
  const prevCompleted = useRef(0);

  useEffect(() => {
    if (activeLessonPanel) action1();
  }, [activeLessonPanel]);

  useEffect(() => {
    if (completedZones.length > prevCompleted.current) {
      prevCompleted.current = completedZones.length;
      action3();
    }
  }, [completedZones]);

  return null;
}
