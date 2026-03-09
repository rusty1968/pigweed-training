const BAZEL = "#00FFB2";
const PURPLE = "#A78BFA";
const DIM = "#1A2235";

export default function MasterSlide({ onSelectTrack }) {
  const tracks = [
    {
      id: "bazel",
      color: BAZEL,
      title: "BAZEL",
      subtitle: "BUILD SYSTEM FUNDAMENTALS",
      items: [
        "Why Bazel for pw_kernel?",
        "Build Anatomy & Learning Roadmap",
        "Core Properties & Flashcards",
        "Rust + Bazel & Embedded Bzlmod",
      ],
      count: 7,
    },
    {
      id: "kernel",
      color: PURPLE,
      title: "pw_kernel",
      subtitle: "KERNEL INTERNALS",
      items: [
        "Kernel Objects — Building Blocks",
        "Threads & Processes — Execution Model",
        "Channel IPC & Signal State Machine",
        "Wait Groups — Multiplexed Waiting",
      ],
      count: 6,
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#080C14",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      color: "#E2E8F0", textAlign: "center", padding: "40px",
    }}>
      <div style={{ fontSize: 11, letterSpacing: 6, color: "#4A5568", marginBottom: 16 }}>
        INTERNAL DEVELOPER TRAINING
      </div>

      <div style={{
        fontSize: 56, fontWeight: 900, letterSpacing: 10,
        background: "linear-gradient(135deg, #00FFB2, #A78BFA)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: 8,
      }}>TRAINING</div>

      <div style={{ fontSize: 14, letterSpacing: 4, color: "#4A5568", marginBottom: 48 }}>
        SELECT A TRACK
      </div>

      <div style={{ display: "flex", gap: 24, maxWidth: 780, width: "100%" }}>
        {tracks.map((track) => (
          <div
            key={track.id}
            onClick={() => onSelectTrack(track.id)}
            style={{
              flex: 1, border: `1px solid ${DIM}`, borderRadius: 6,
              padding: "32px 28px", background: "#0D1320",
              cursor: "pointer", position: "relative", overflow: "hidden",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = track.color;
              e.currentTarget.style.boxShadow = `0 0 24px ${track.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = DIM;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Top accent */}
            <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: 2,
              background: `linear-gradient(90deg, transparent, ${track.color}, transparent)`,
            }} />

            <div style={{
              fontSize: 28, fontWeight: 900, letterSpacing: 6,
              color: track.color, marginBottom: 6,
            }}>{track.title}</div>

            <div style={{
              fontSize: 10, letterSpacing: 3, color: "#4A5568", marginBottom: 24,
            }}>{track.subtitle}</div>

            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              textAlign: "left", marginBottom: 20,
            }}>
              {track.items.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 10, color: "#64748B", letterSpacing: 1,
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: `${track.color}40`,
                    border: `1px solid ${track.color}60`,
                  }} />
                  {item}
                </div>
              ))}
            </div>

            <div style={{
              fontSize: 9, letterSpacing: 3, color: track.color,
              border: `1px solid ${track.color}40`, borderRadius: 3,
              padding: "6px 12px", display: "inline-block",
            }}>{track.count} SLIDES →</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48, fontSize: 10, letterSpacing: 3, color: "#2D3F55" }}>
        CLICK A TRACK TO BEGIN
      </div>
    </div>
  );
}
