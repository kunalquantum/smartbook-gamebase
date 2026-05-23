import { useEffect } from "react";
import { useSmartbook } from "../src/stores/useSmartbook";

const ALL_ZONES = ["math", "science", "reading", "history"];

const ZONE_META = {
  math:    { color: "#4f9cf9", label: "Math Zone",    emoji: "∑" },
  science: { color: "#4ecb71", label: "Science Zone",  emoji: "⚗" },
  reading: { color: "#f9a14f", label: "Reading Zone",  emoji: "📖" },
  history: { color: "#c47af9", label: "History Zone",  emoji: "🏛" },
};

export default function SmartbookHUD() {
  const { currentZone, score, completedZones, activeLessonPanel, openLesson } =
    useSmartbook();

  // "E" key opens lesson when in a zone
  useEffect(() => {
    const handler = (e) => {
      if (e.code === "KeyE" && currentZone && !activeLessonPanel) {
        openLesson();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentZone, activeLessonPanel, openLesson]);

  const meta = currentZone ? ZONE_META[currentZone] : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10,10,20,0.65)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: 14,
          padding: "8px 22px",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 13,
          fontWeight: 600,
          border: "1px solid rgba(255,255,255,0.1)",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: 15 }}>📚 Smartbook</span>
        <span style={{ color: "#ffd700", letterSpacing: 1 }}>
          ★ {score}
        </span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>
          {completedZones.length}/{ALL_ZONES.length} zones
        </span>
      </div>

      {/* ── Zone dots ── */}
      <div
        style={{
          position: "fixed",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        {ALL_ZONES.map((zone) => {
          const { color } = ZONE_META[zone];
          const done = completedZones.includes(zone);
          const active = currentZone === zone;
          return (
            <div
              key={zone}
              title={ZONE_META[zone].label}
              style={{
                width: active ? 14 : 11,
                height: active ? 14 : 11,
                borderRadius: "50%",
                background: done || active ? color : "rgba(255,255,255,0.15)",
                border: `2px solid ${color}`,
                transition: "all 0.25s",
                boxShadow: active ? `0 0 12px ${color}` : "none",
              }}
            />
          );
        })}
      </div>

      {/* ── Zone entry prompt ── */}
      {currentZone && !activeLessonPanel && (
        <div
          style={{
            position: "fixed",
            bottom: 64,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(10,10,20,0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: 12,
            padding: "11px 24px",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
            border: `1px solid ${meta.color}55`,
            pointerEvents: "auto",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: `0 4px 24px ${meta.color}33`,
          }}
          onClick={openLesson}
        >
          <span style={{ fontSize: 18 }}>{meta.emoji}</span>
          <span style={{ color: meta.color }}>{meta.label}</span>
          <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 400, fontSize: 12 }}>
            click or press
          </span>
          <kbd
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 5,
              padding: "2px 7px",
              fontSize: 12,
              fontFamily: "monospace",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            E
          </kbd>
        </div>
      )}
    </div>
  );
}
