import { useSmartbook } from "../src/stores/useSmartbook";

const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "0.00");

export default function NewtonsHUD() {
  const currentZone = useSmartbook((s) => s.currentZone);
  const activeLessonPanel = useSmartbook((s) => s.activeLessonPanel);
  const newton = useSmartbook((s) => s.newton);

  if (currentZone !== "science" || activeLessonPanel) return null;

  const { gravity, law1, law2, law3 } = newton;

  return (
    <div
      style={{
        position: "fixed",
        top: 78,
        right: 18,
        width: 280,
        background: "rgba(8, 8, 22, 0.82)",
        border: "1px solid rgba(78, 203, 113, 0.4)",
        borderRadius: 14,
        padding: "16px 18px",
        color: "white",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "#4ecb71", marginBottom: 2 }}>
        🍎 Newton's World — live
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
        gravity g = {fmt(gravity)} m/s²
      </div>

      <Law
        n={1}
        name="Inertia"
        formula="v = constant (no net force)"
        color="#e0413f"
        lines={[
          `speed = ${fmt(law1.velocity)} m/s`,
          law1.atRest ? "state: at rest" : "state: moving — push it to feel it keep going!",
        ]}
      />

      <Law
        n={2}
        name="F = m · a"
        formula="Force = mass × acceleration"
        color="#4f9cf9"
        lines={[
          `m = ${fmt(law2.mass)} kg`,
          `a = ${fmt(law2.acceleration)} m/s²`,
          `F = ${fmt(law2.force)} N`,
        ]}
      />

      <Law
        n={3}
        name="Action–Reaction"
        formula="F(A→B) = −F(B→A)"
        color="#c47af9"
        last
        lines={
          law3.active
            ? [
                `mass A = ${fmt(law3.massA, 1)} kg, mass B = ${fmt(law3.massB, 1)} kg`,
                `F on A = ${fmt(law3.forceA)} N`,
                `F on B = ${fmt(law3.forceB)} N`,
              ]
            : ["waiting for the balls to collide…"]
        }
      />
    </div>
  );
}

function Law({ n, name, formula, color, lines, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color,
            border: `1px solid ${color}66`,
            borderRadius: 5,
            padding: "1px 5px",
          }}
        >
          LAW {n}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{name}</span>
      </div>
      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
        {formula}
      </div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
          {l}
        </div>
      ))}
    </div>
  );
}
