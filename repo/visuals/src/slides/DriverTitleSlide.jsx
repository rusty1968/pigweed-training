const BG = "#080C14";
const BLUE = "#38BDF8";
const PURPLE = "#A78BFA";
const ORANGE = "#FF6B35";
const BAZEL = "#00FFB2";
const RUST = "#CE422B";
const DIM = "#1A2235";
const TEXT = "#94A3B8";

const modules = [
  { n: "01", label: "ORIENTATION", desc: "Five-crate architecture", color: BLUE },
  { n: "02", label: "WIRE PROTOCOL", desc: "Byte-level header format", color: ORANGE },
  { n: "03", label: "CLIENT TYPES", desc: "Type-safe API vocabulary", color: PURPLE },
  { n: "04", label: "BACKEND", desc: "Hardware register adapter", color: RUST },
  { n: "05", label: "SERVER LOOP", desc: "Three-syscall dispatch", color: BAZEL },
  { n: "06", label: "IPC CLIENT", desc: "Ergonomic client library", color: BLUE },
  { n: "07", label: "SYSTEM CONFIG", desc: "system.json5 wiring", color: ORANGE },
  { n: "08", label: "BAZEL BUILD", desc: "Build graph → flashable ELF", color: BAZEL },
  { n: "09", label: "TESTING", desc: "Integration test patterns", color: PURPLE },
  { n: "10", label: "EXERCISES", desc: "Extend the service", color: RUST },
];

export default function DriverTitleSlide() {
  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 12 }}>
        pw_kernel TRAINING TRACK
      </div>
      <div style={{
        fontSize: 36, fontWeight: 900, letterSpacing: 8,
        background: "linear-gradient(135deg, #38BDF8, #FF6B35)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: 8,
      }}>USERSPACE DRIVERS</div>
      <div style={{ fontSize: 12, letterSpacing: 3, color: "#4A5568", marginBottom: 6 }}>
        Building a peripheral service on pw_kernel
      </div>
      <div style={{ fontSize: 11, letterSpacing: 2, color: "#334155", marginBottom: 36 }}>
        Running example: <span style={{ color: ORANGE }}>I2C service</span> on AST1060
      </div>

      {/* Module roadmap grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10,
        maxWidth: 820, width: "100%",
      }}>
        {modules.map((m) => (
          <div key={m.n} style={{
            border: `1px solid ${DIM}`, borderRadius: 4,
            padding: "14px 12px", background: "#0D1320", position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: 2,
              background: `linear-gradient(90deg, transparent, ${m.color}60, transparent)`,
            }} />
            <div style={{
              fontSize: 9, color: m.color, fontWeight: 700, letterSpacing: 2, marginBottom: 4,
            }}>{m.n}</div>
            <div style={{ fontSize: 10, color: "#E2E8F0", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 9, color: TEXT, lineHeight: 1.5 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Prerequisites */}
      <div style={{
        marginTop: 28, border: `1px solid ${DIM}`, borderRadius: 4,
        padding: "16px 24px", background: "#0D1320", maxWidth: 820, width: "100%",
      }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 10 }}>
          PREREQUISITES
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Embedded Rust", desc: "#![no_std], #![no_main]", color: RUST },
            { label: "Bazel Basics", desc: "load, deps, visibility", color: BAZEL },
            { label: "I2C Protocol", desc: "START, addr, ACK/NAK", color: BLUE },
          ].map((p) => (
            <div key={p.label} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: p.color, boxShadow: `0 0 8px ${p.color}`,
              }} />
              <div>
                <div style={{ fontSize: 10, color: p.color, fontWeight: 700, letterSpacing: 1 }}>{p.label}</div>
                <div style={{ fontSize: 9, color: TEXT }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 10, letterSpacing: 3, color: "#2D3F55" }}>
        → NAVIGATE TO BEGIN
      </div>
    </div>
  );
}
