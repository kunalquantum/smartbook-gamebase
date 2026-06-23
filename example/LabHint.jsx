import { useSmartbook } from "../src/stores/useSmartbook";

const HINTS = {
  newton: "🖱️ Flick-drag the red apple or yellow/purple balls to fling them — lift-drag the blue ball and let go to feel F = m·a",
  optics: "🖱️ Drag the glowing yellow handle to sweep the light's angle",
  ohms:   "🖱️ Drag the resistor up/down to change resistance and watch the LED",
  waves:  "🖱️ Drag the yellow handle left/right to change the wave's frequency",
  energy: "🖱️ Grab the purple ball and lift it, then let go to watch it fall",
};

const ZONE_ACCENT = {
  newton: "#4ecb71",
  optics: "#4f9cf9",
  ohms:   "#f9a14f",
  waves:  "#5fd0e0",
  energy: "#c47af9",
};

export default function LabHint() {
  const currentZone = useSmartbook((s) => s.currentZone);
  const activeLessonPanel = useSmartbook((s) => s.activeLessonPanel);

  if (!currentZone || activeLessonPanel) return null;
  const color = ZONE_ACCENT[currentZone];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 22,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(8, 8, 22, 0.78)",
        border: `1px solid ${color}66`,
        borderRadius: 999,
        padding: "8px 18px",
        color: "white",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: 12.5,
        whiteSpace: "nowrap",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      {HINTS[currentZone]}
    </div>
  );
}
