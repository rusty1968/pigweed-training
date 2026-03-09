const BAZEL = "#00FFB2";
const PURPLE = "#A78BFA";
const ORANGE = "#FF6B35";
const BLUE = "#38BDF8";
const DIM = "#1A2235";

export default function TitleSlide() {
  const tracks = [
    {
      color: PURPLE,
      title: "KERNEL",
      subtitle: "pw_kernel Internals",
      items: ["Design Philosophy", "Kernel Objects & Interrupts", "Threads, Processes & Channels", "Wait Groups"],
      count: 7,
    },
    {
      color: BAZEL,
      title: "BAZEL",
      subtitle: "Build System Fundamentals",
      items: ["Why Bazel for pw_kernel?", "Build Anatomy & Roadmap", "Core Properties & Flashcards", "Rust + Bazel & Bzlmod"],
      count: 7,
    },
    {
      color: ORANGE,
      title: "DRIVERS",
      subtitle: "Userspace Peripheral Services",
      items: ["5-Crate Architecture", "Backend & Server Loop", "Build Graph & system.json5", "Testing & Exercises"],
      count: 4,
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080C14",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      color: "#E2E8F0",
      textAlign: "center",
      padding: "40px",
    }}>
      <div style={{ fontSize: 11, letterSpacing: 6, color: "#4A5568", marginBottom: 16 }}>
        INTERNAL DEVELOPER TRAINING
      </div>

      <div style={{
        fontSize: 72, fontWeight: 900, letterSpacing: 12,
        background: `linear-gradient(135deg, ${PURPLE}, ${BAZEL}, ${ORANGE})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: 8,
      }}>OPENPROT</div>

      <div style={{ fontSize: 14, letterSpacing: 6, color: "#4A5568", marginBottom: 60 }}>
        KERNEL · BAZEL · DRIVERS
      </div>

      <div style={{
        width: 1, height: 40,
        background: `linear-gradient(180deg, ${PURPLE}, transparent)`,
        marginBottom: 40,
      }} />

      <div style={{ display: "flex", gap: 24, maxWidth: 900 }}>
        {tracks.map((track) => (
          <div key={track.title} style={{
            flex: 1,
            border: `1px solid ${track.color}20`,
            borderRadius: 6,
            padding: "20px 18px",
            background: "#0D1320",
          }}>
            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 4, color: track.color, marginBottom: 4 }}>
              {track.title}
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#4A5568", marginBottom: 14 }}>
              {track.subtitle}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {track.items.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 10px",
                  borderLeft: `2px solid ${track.color}30`,
                }}>
                  <div style={{ fontSize: 9, color: track.color, letterSpacing: 2, minWidth: 20 }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: "#64748B" }}>{item}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 9, letterSpacing: 2, color: "#334155" }}>
              {track.count} SLIDES
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 60, fontSize: 10, letterSpacing: 3, color: "#2D3F55" }}>
        USE ARROW KEYS OR CLICK → TO NAVIGATE
      </div>
    </div>
  );
}
