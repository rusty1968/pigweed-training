const BAZEL = "#00FFB2";
const RUST = "#CE422B";
const PURPLE = "#A78BFA";
const BLUE = "#38BDF8";
const ORANGE = "#FF6B35";
const DIM = "#1A2235";
const TEXT = "#94A3B8";

const phases = [
  {
    n: "01",
    label: "READ",
    color: BAZEL,
    title: "Understand what's there",
    items: [
      { concept: "BUILD.bazel", maps: "rust_library, deps, srcs — the basic target graph" },
      { concept: "MODULE.bazel", maps: "bazel_dep(), use_extension() — how deps get fetched" },
      { concept: "select()", maps: "how pw_kernel picks arch-specific code per platform" },
    ],
  },
  {
    n: "02",
    label: "MODIFY",
    color: BLUE,
    title: "Change existing targets",
    items: [
      { concept: "Add a dep", maps: "wire a new crate into kernel or a lib's BUILD.bazel" },
      { concept: "Add a source", maps: "register a new .rs file in srcs for an existing target" },
      { concept: "Add a flag", maps: "new bool_flag() + config_setting for feature toggles" },
    ],
  },
  {
    n: "03",
    label: "EXTEND",
    color: PURPLE,
    title: "Create new targets & rules",
    items: [
      { concept: "New library", maps: "add a pw_kernel/lib/my_lib with its own BUILD.bazel" },
      { concept: "New target board", maps: "platform() + linker script + system_image entry" },
      { concept: "Custom rule", maps: "write .bzl rules for project-specific codegen" },
    ],
  },
];

export default function LearningRoadmap() {
  return (
    <div style={{
      minHeight: "100vh", background: "#080C14",
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 10 }}>
          TRAINING PATH
        </div>
        <div style={{
          fontSize: 32, fontWeight: 900, letterSpacing: 6,
          background: "linear-gradient(135deg, #00FFB2, #38BDF8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 6,
        }}>LEARNING ROADMAP</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568" }}>
          FROM READING BUILD FILES TO WRITING CUSTOM RULES
        </div>
      </div>

      {/* Phase cards */}
      <div style={{ width: "100%", maxWidth: 780, display: "flex", flexDirection: "column", gap: 0 }}>
        {phases.map((phase, pi) => (
          <div key={phase.n}>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              background: "#0D1320", overflow: "hidden",
              position: "relative",
            }}>
              {/* Left accent bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, width: 3, height: "100%",
                background: phase.color,
              }} />

              {/* Phase header */}
              <div style={{
                padding: "16px 24px 12px 24px",
                display: "flex", alignItems: "center", gap: 16,
                borderBottom: `1px solid ${DIM}`,
              }}>
                <div style={{
                  fontSize: 20, fontWeight: 900, color: phase.color,
                  letterSpacing: 4, opacity: 0.4,
                }}>{phase.n}</div>
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 700, letterSpacing: 4, color: phase.color,
                  }}>{phase.label}</div>
                  <div style={{ fontSize: 10, color: "#4A5568", letterSpacing: 2, marginTop: 2 }}>
                    {phase.title}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: "14px 24px 16px 24px" }}>
                {phase.items.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "8px 0",
                    borderBottom: i < phase.items.length - 1 ? `1px solid ${DIM}` : "none",
                  }}>
                    <div style={{
                      fontSize: 11, letterSpacing: 2, color: phase.color,
                      fontWeight: 700, minWidth: 140,
                      background: `${phase.color}10`, border: `1px solid ${phase.color}25`,
                      borderRadius: 3, padding: "4px 10px",
                      flexShrink: 0,
                    }}>{item.concept}</div>
                    <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.6, letterSpacing: 0.3, paddingTop: 3 }}>
                      {item.maps}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow connector */}
            {pi < phases.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
                }}>
                  <div style={{ width: 1, height: 12, background: `linear-gradient(180deg, ${phases[pi].color}, ${phases[pi + 1].color})` }} />
                  <div style={{ fontSize: 10, color: phases[pi + 1].color }}>&#9662;</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom callout */}
      <div style={{
        marginTop: 32, width: "100%", maxWidth: 780,
        display: "flex", gap: 16,
      }}>
        <div style={{
          flex: 1, border: `1px solid ${RUST}30`, borderRadius: 4,
          padding: "14px 20px", background: `${RUST}08`,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: RUST, fontWeight: 700, marginBottom: 4 }}>
            YOU DON'T NEED
          </div>
          <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.6 }}>
            Deep Starlark expertise, remote execution setup, or Bazel plugin authoring to get started.
          </div>
        </div>
        <div style={{
          flex: 1, border: `1px solid ${BAZEL}30`, borderRadius: 4,
          padding: "14px 20px", background: `${BAZEL}08`,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: BAZEL, fontWeight: 700, marginBottom: 4 }}>
            YOU DO NEED
          </div>
          <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.6 }}>
            To read BUILD files fluently, understand select(), and know how platforms drive cross-compilation.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28, fontSize: 9, letterSpacing: 3, color: "#1E2D45", textAlign: "center" }}>
        SLIDE 3 OF 3 · INTRODUCTION
      </div>
    </div>
  );
}
