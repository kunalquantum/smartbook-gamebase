import { useSmartbook } from "../src/stores/useSmartbook";

const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "0.00");

const ZONE_ACCENT = {
  newton: "#4ecb71",
  optics: "#4f9cf9",
  ohms:   "#f9a14f",
  waves:  "#5fd0e0",
  energy: "#c47af9",
};

/**
 * One live readout panel, reused across every physics zone. Each zone
 * pushes its own real, frame-by-frame computed values into the Smartbook
 * store; this HUD just renders whichever slice matches the zone you're
 * standing in.
 */
export default function PhysicsHUD() {
  const currentZone = useSmartbook((s) => s.currentZone);
  const activeLessonPanel = useSmartbook((s) => s.activeLessonPanel);
  const newton = useSmartbook((s) => s.newton);
  const optics = useSmartbook((s) => s.optics);
  const ohms = useSmartbook((s) => s.ohms);
  const waves = useSmartbook((s) => s.waves);
  const energy = useSmartbook((s) => s.energy);

  if (!currentZone || activeLessonPanel) return null;
  const color = ZONE_ACCENT[currentZone];

  return (
    <div
      style={{
        position: "fixed",
        top: 78,
        right: 18,
        width: 280,
        background: "rgba(8, 8, 22, 0.82)",
        border: `1px solid ${color}66`,
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
      {currentZone === "newton" && <NewtonPanel color={color} newton={newton} />}
      {currentZone === "optics" && <OpticsPanel color={color} optics={optics} />}
      {currentZone === "ohms" && <OhmsPanel color={color} ohms={ohms} />}
      {currentZone === "waves" && <WavesPanel color={color} waves={waves} />}
      {currentZone === "energy" && <EnergyPanel color={color} energy={energy} />}
    </div>
  );
}

function Header({ color, title, sub }) {
  return (
    <>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>{sub}</div>
    </>
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
          {n}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{name}</span>
      </div>
      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>{formula}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
          {l}
        </div>
      ))}
    </div>
  );
}

function NewtonPanel({ color, newton }) {
  const { gravity, law1, law2, law3 } = newton;
  return (
    <>
      <Header color={color} title="🍎 Newton's World — live" sub={`gravity g = ${fmt(gravity)} m/s²`} />
      <Law n="LAW 1" name="Inertia" formula="v = constant (no net force)" color="#e0413f"
        lines={[
          `speed = ${fmt(law1.velocity)} m/s`,
          law1.atRest ? "state: at rest" : "state: moving — push it to feel it keep going!",
        ]}
      />
      <Law n="LAW 2" name="F = m · a" formula="Force = mass × acceleration" color="#4f9cf9"
        lines={[`m = ${fmt(law2.mass)} kg`, `a = ${fmt(law2.acceleration)} m/s²`, `F = ${fmt(law2.force)} N`]}
      />
      <Law n="LAW 3" name="Action–Reaction" formula="F(A→B) = −F(B→A)" color="#c47af9" last
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
    </>
  );
}

function OpticsPanel({ color, optics }) {
  const { n1, n2, incidentAngle, reflectedAngle, refractedAngle } = optics;
  return (
    <>
      <Header color={color} title="🔭 Optics Lab — live" sub={`n(air) = ${fmt(n1, 1)}, n(glass) = ${fmt(n2, 1)}`} />
      <Law n="REFLECTION" name="Law of Reflection" formula="θ(reflected) = θ(incident)" color="#ff8a4f"
        lines={[`θ in = ${fmt(incidentAngle, 1)}°`, `θ reflected = ${fmt(reflectedAngle, 1)}°`]}
      />
      <Law n="REFRACTION" name="Snell's Law" formula="n₁ sin θ₁ = n₂ sin θ₂" color="#4fd1ff" last
        lines={[`θ₁ (incidence) = ${fmt(incidentAngle, 1)}°`, `θ₂ (refracted) = ${fmt(refractedAngle, 1)}°`]}
      />
    </>
  );
}

function OhmsPanel({ color, ohms }) {
  const { voltage, resistance, current } = ohms;
  return (
    <>
      <Header color={color} title="🔋 Circuit Lab — live" sub="9V battery → resistor → LED" />
      <Law n="OHM'S LAW" name="V = I · R" formula="Current = Voltage / Resistance" color="#f9a14f" last
        lines={[
          `V = ${fmt(voltage, 1)} V`,
          `R = ${fmt(resistance, 1)} Ω`,
          `I = ${fmt(current, 2)} A`,
        ]}
      />
    </>
  );
}

function WavesPanel({ color, waves }) {
  const { frequency, amplitude, speed, wavelength } = waves;
  return (
    <>
      <Header color={color} title="🌊 Waves Lab — live" sub={`wave speed = ${fmt(speed, 1)} m/s (fixed)`} />
      <Law n="WAVE EQUATION" name="v = f · λ" formula="speed = frequency × wavelength" color="#5fd0e0" last
        lines={[
          `f (frequency) = ${fmt(frequency, 2)} Hz`,
          `λ (wavelength) = ${fmt(wavelength, 2)} m`,
          `A (amplitude) = ${fmt(amplitude, 2)} m`,
        ]}
      />
    </>
  );
}

function EnergyPanel({ color, energy }) {
  const { mass, height, velocity, pe, ke, total } = energy;
  return (
    <>
      <Header color={color} title="⚡ Energy Lab — live" sub={`m = ${fmt(mass, 1)} kg ball in a valley`} />
      <Law n="POTENTIAL" name="PE = m · g · h" formula="" color="#c47af9"
        lines={[`h = ${fmt(height)} m`, `PE = ${fmt(pe)} J`]}
      />
      <Law n="KINETIC" name="KE = ½ · m · v²" formula="" color="#f9a14f"
        lines={[`v = ${fmt(velocity)} m/s`, `KE = ${fmt(ke)} J`]}
      />
      <Law n="TOTAL" name="Conservation of Energy" formula="PE + KE ≈ constant" color="#4ecb71" last
        lines={[`PE + KE = ${fmt(total)} J`]}
      />
    </>
  );
}
