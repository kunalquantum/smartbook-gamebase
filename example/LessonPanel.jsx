import { useSmartbook } from "../src/stores/useSmartbook";

const ZONE_COLORS = {
  math:    "#4f9cf9",
  science: "#4ecb71",
  reading: "#f9a14f",
  history: "#c47af9",
};

export default function LessonPanel() {
  const { activeLessonPanel, currentZone, lessons, completedZones, closeLesson, completeLesson } =
    useSmartbook();

  if (!activeLessonPanel || !currentZone) return null;

  const lesson = lessons[currentZone];
  const color = ZONE_COLORS[currentZone];
  const alreadyDone = completedZones.includes(currentZone);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLesson();
      }}
    >
      <div
        style={{
          background: "#0f0f1e",
          border: `2px solid ${color}`,
          borderRadius: 22,
          padding: "44px 52px",
          maxWidth: 540,
          width: "90%",
          color: "white",
          boxShadow: `0 0 80px ${color}28, 0 20px 60px rgba(0,0,0,0.6)`,
          position: "relative",
        }}
      >
        {/* Close × */}
        <button
          onClick={closeLesson}
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            fontSize: 22,
            cursor: "pointer",
            lineHeight: 1,
            padding: 4,
          }}
        >
          ×
        </button>

        {/* Emoji icon */}
        <div
          style={{
            fontSize: 52,
            textAlign: "center",
            marginBottom: 10,
            filter: `drop-shadow(0 0 12px ${color})`,
          }}
        >
          {lesson.emoji}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            textAlign: "center",
            color: color,
            margin: "0 0 22px",
            letterSpacing: 0.5,
          }}
        >
          {lesson.title}
        </h2>

        {/* Content */}
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.8)",
            margin: "0 0 36px",
          }}
        >
          {lesson.content}
        </p>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(to right, transparent, ${color}55, transparent)`,
            marginBottom: 28,
          }}
        />

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={closeLesson}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 11,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "inherit",
            }}
          >
            Back to World
          </button>

          <button
            onClick={completeLesson}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: 11,
              border: "none",
              background: alreadyDone
                ? "rgba(255,255,255,0.08)"
                : color,
              color: alreadyDone ? "rgba(255,255,255,0.4)" : "white",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "inherit",
              letterSpacing: 0.3,
            }}
          >
            {alreadyDone ? "Already Completed ✓" : "Complete Lesson  +100 ★"}
          </button>
        </div>
      </div>
    </div>
  );
}
