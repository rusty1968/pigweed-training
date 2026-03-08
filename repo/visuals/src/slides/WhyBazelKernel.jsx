export default function WhyBazelKernel() {
  const BAZEL = "#00FFB2";
  const RUST = "#CE422B";
  const PURPLE = "#A78BFA";
  const BLUE = "#38BDF8";
  const DIM = "#1A2235";
  const TEXT = "#94A3B8";

  const problems = [
    {
      icon: "\u2699",
      label: "MULTI-ARCH",
      color: BAZEL,
      desc: "One kernel, many targets: ARM Cortex-M33, RISC-V, host — all from one source tree",
    },
    {
      icon: "\u26A1",
      label: "CUSTOM RULES",
      color: PURPLE,
      desc: "Linker scripts, system images, and codegen that cargo alone can't express",
    },
    {
      icon: "\uD83D\uDD12",
      label: "HERMETIC BUILDS",
      color: BLUE,
      desc: "An RTOS must be reproducible — the same commit must always produce the same binary",
    },
    {
      icon: "\uD83E\uDDE9",
      label: "POLYGLOT GRAPH",
      color: RUST,
      desc: "Rust kernel + proc macros + C HAL + Jinja2 codegen + Protobuf — unified in one build graph",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#080C14",
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 12 }}>
          MOTIVATION
        </div>
        <div style={{
          fontSize: 36, fontWeight: 900, letterSpacing: 6,
          background: "linear-gradient(135deg, #00FFB2, #CE422B)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>WHY BAZEL FOR pw_kernel?</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568", maxWidth: 540, lineHeight: 1.7 }}>
          cargo builds Rust crates. Bazel builds <span style={{ color: BAZEL }}>systems</span> —
          the kernel, its targets, its generated code, and its test infrastructure.
        </div>
      </div>

      {/* Problem cards */}
      <div style={{
        width: "100%", maxWidth: 780,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
      }}>
        {problems.map((p) => (
          <div key={p.label} style={{
            border: `1px solid ${DIM}`, borderRadius: 4,
            padding: "20px 24px", background: "#0D1320",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: 2,
              background: `linear-gradient(90deg, transparent, ${p.color}60, transparent)`,
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{p.icon}</span>
              <div style={{ fontSize: 11, letterSpacing: 4, color: p.color, fontWeight: 700 }}>{p.label}</div>
            </div>
            <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7, letterSpacing: 0.5 }}>
              {p.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom insight */}
      <div style={{
        marginTop: 36, width: "100%", maxWidth: 780,
        border: `1px solid ${BAZEL}30`, borderRadius: 4,
        padding: "16px 24px", background: `${BAZEL}08`,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: BAZEL, fontWeight: 700, marginBottom: 6 }}>
          THE GOAL
        </div>
        <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.7 }}>
          Learn enough Bazel to read, modify, and extend <span style={{ color: RUST, fontWeight: 700 }}>pw_kernel</span>'s
          build — not to become a Bazel expert from scratch.
        </div>
      </div>

      <div style={{ marginTop: 32, fontSize: 9, letterSpacing: 3, color: "#1E2D45" }}>
        SLIDE 1 OF 3 · INTRODUCTION
      </div>
    </div>
  );
}
