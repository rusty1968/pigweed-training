export default function TitleSlide() {
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
        background: "linear-gradient(135deg, #00FFB2, #38BDF8)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: 8,
      }}>BAZEL</div>

      <div style={{ fontSize: 16, letterSpacing: 4, color: "#4A5568", marginBottom: 60 }}>
        BUILD SYSTEM FUNDAMENTALS
      </div>

      <div style={{
        width: 1, height: 60,
        background: "linear-gradient(180deg, #00FFB2, transparent)",
        marginBottom: 40,
      }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
        {[
          { n: "01", label: "Why Bazel for pw_kernel?" },
          { n: "02", label: "pw_kernel Build Anatomy" },
          { n: "03", label: "Learning Roadmap — Read → Modify → Extend" },
          { n: "04", label: "Core Properties" },
          { n: "05", label: "Deep Dive — Flashcards" },
          { n: "06", label: "Rust + Bazel" },
          { n: "07", label: "Embedded Bzlmod — MODULE.bazel + Cortex-M" },
        ].map((item) => (
          <div key={item.n} style={{
            display: "flex", alignItems: "center", gap: 16,
            border: "1px solid #1A2235", borderRadius: 4,
            padding: "12px 20px", background: "#0D1320",
          }}>
            <div style={{ fontSize: 10, color: "#00FFB2", letterSpacing: 2, minWidth: 24 }}>{item.n}</div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#64748B" }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 60, fontSize: 10, letterSpacing: 3, color: "#2D3F55" }}>
        USE ARROW KEYS OR CLICK → TO NAVIGATE
      </div>
    </div>
  );
}
