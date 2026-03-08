import { useState } from "react";

const properties = [
  {
    id: "correctness", label: "CORRECTNESS", color: "#00FFB2",
    sub: [
      { name: "Hermetic", desc: "Actions run in isolation with no undeclared inputs" },
      { name: "Reproducible", desc: "Same inputs always yield identical outputs" },
      { name: "Explicit Deps", desc: "All dependencies must be declared upfront" },
    ],
  },
  {
    id: "speed", label: "SPEED", color: "#FF6B35",
    sub: [
      { name: "Incremental", desc: "Only rebuilds what actually changed" },
      { name: "Parallel", desc: "Independent actions run concurrently" },
      { name: "Remote Cache", desc: "Share build artifacts across your team" },
      { name: "Remote Exec", desc: "Distribute builds across a cluster" },
    ],
  },
  {
    id: "scale", label: "SCALABILITY", color: "#A78BFA",
    sub: [
      { name: "Monorepo", desc: "Handles millions of lines & thousands of targets" },
      { name: "Multi-lang", desc: "Java, C++, Python, Go, Rust in one graph" },
      { name: "Google Scale", desc: "Derived from Google's internal Blaze system" },
    ],
  },
  {
    id: "extend", label: "EXTENSIBILITY", color: "#38BDF8",
    sub: [
      { name: "Starlark", desc: "Python-like DSL to write custom rules & macros" },
      { name: "Ecosystem", desc: "rules_go, rules_python, rules_js and hundreds more" },
    ],
  },
];

const foundations = [
  { name: "HERMETICITY", color: "#00FFB2", desc: "No hidden state. Every action is a pure function of its declared inputs." },
  { name: "INCREMENTALITY", color: "#FF6B35", desc: "The build graph knows exactly what changed — nothing more is rebuilt." },
];

export default function BazelDiagram() {
  const [active, setActive] = useState(null);

  return (
    <div style={{
      minHeight: "100vh", background: "#080C14",
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#4A5568", marginBottom: 8 }}>BUILD SYSTEM ARCHITECTURE</div>
        <div style={{
          fontSize: 38, fontWeight: 900, letterSpacing: 8,
          background: "linear-gradient(135deg, #00FFB2, #38BDF8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>BAZEL</div>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#4A5568", marginTop: 4 }}>ESSENTIAL PROPERTIES</div>
      </div>

      <div style={{ width: "100%", maxWidth: 780 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {properties.map((p) => (
            <div key={p.id} onClick={() => setActive(active === p.id ? null : p.id)} style={{
              border: `1px solid ${active === p.id ? p.color : "#1A2235"}`,
              borderRadius: 4, padding: "20px 24px", cursor: "pointer",
              background: active === p.id ? `${p.color}10` : "#0D1320",
              transition: "all 0.2s ease",
              boxShadow: active === p.id ? `0 0 20px ${p.color}30` : "none",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, right: 0, width: 32, height: 32,
                borderBottom: `1px solid ${p.color}50`, borderLeft: `1px solid ${p.color}50`,
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                <div style={{ fontSize: 11, letterSpacing: 4, color: p.color, fontWeight: 700 }}>{p.label}</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.sub.map((s) => (
                  <div key={s.name} style={{
                    fontSize: 10, letterSpacing: 1, color: "#64748B",
                    background: "#0A0F1A", border: "1px solid #1E2D45",
                    borderRadius: 2, padding: "3px 8px",
                  }}>{s.name}</div>
                ))}
              </div>
              {active === p.id && (
                <div style={{ marginTop: 16, borderTop: `1px solid ${p.color}30`, paddingTop: 14 }}>
                  {p.sub.map((s) => (
                    <div key={s.name} style={{ marginBottom: 8, display: "flex", gap: 10 }}>
                      <div style={{ color: p.color, fontSize: 10, minWidth: 80, letterSpacing: 1, paddingTop: 1 }}>{s.name}</div>
                      <div style={{ color: "#94A3B8", fontSize: 11, lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", textAlign: "center", marginBottom: 8 }}>── FOUNDATIONAL PILLARS ──</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {foundations.map((f) => (
            <div key={f.name} style={{
              border: `1px solid ${f.color}40`, borderRadius: 4,
              padding: "16px 20px", background: `${f.color}08`, position: "relative",
            }}>
              <div style={{
                position: "absolute", top: -1, left: 20, right: 20, height: 2,
                background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
              }} />
              <div style={{ fontSize: 11, letterSpacing: 3, color: f.color, fontWeight: 700, marginBottom: 6 }}>{f.name}</div>
              <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, textAlign: "center", fontSize: 10, color: "#2D3F55", letterSpacing: 2 }}>
          CLICK ANY PROPERTY TO EXPAND  ·  DERIVED FROM GOOGLE'S BLAZE
        </div>
      </div>
    </div>
  );
}
