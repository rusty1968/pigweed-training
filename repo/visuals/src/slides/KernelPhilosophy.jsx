import { useState } from "react";

const PURPLE = "#A78BFA";
const BLUE = "#38BDF8";
const BAZEL = "#00FFB2";
const RUST = "#CE422B";
const ORANGE = "#FF6B35";
const DIM = "#1A2235";
const TEXT = "#94A3B8";
const BG = "#080C14";

const pillars = [
  {
    icon: "\uD83D\uDD12",
    label: "SECURE",
    color: PURPLE,
    tagline: "Capability-based isolation",
    quote:
      "We are moving away from the \u2018flat\u2019 shared-memory model typical of old-school RTOSs. By implementing a full capability model, we ensure that components only have access to the specific resources they need, drastically reducing the attack surface.",
    details: [
      "Full capability model — no global access",
      "Each component sees only its own resources",
      "Flat shared-memory model is eliminated",
      "Attack surface shrinks by design, not policy",
    ],
  },
  {
    icon: "\u2699\uFE0F",
    label: "FLEXIBLE",
    color: BLUE,
    tagline: "You choose the trade-offs",
    quote:
      "You decide the priority. If your product needs extreme security, you can dial that up; if you need raw, bare-metal performance for a specific business logic task, the kernel stays out of your way.",
    details: [
      "Security vs. performance — your call",
      "Dial up isolation when the threat model demands it",
      "Step back for bare-metal speed when you need it",
      "The kernel adapts to you, not the other way around",
    ],
  },
  {
    icon: "\u2696\uFE0F",
    label: "STATIC vs. DYNAMIC",
    color: BAZEL,
    tagline: "Pay only for what you use",
    quote:
      "We aren\u2019t picking sides. We aggressively support both allocation styles. Our philosophy is \u2018pay for what you use\u2019\u2014if you don\u2019t use dynamic features, you don\u2019t carry the overhead for them.",
    details: [
      "Static and dynamic allocation both first-class",
      "No unused feature adds overhead",
      "Embedded-friendly: fully static configs supported",
      "Dynamic when you need flexibility, static when you don\u2019t",
    ],
  },
];

export default function KernelPhilosophy() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 12 }}>
          DESIGN PRINCIPLES
        </div>
        <div style={{
          fontSize: 34, fontWeight: 900, letterSpacing: 6,
          background: "linear-gradient(135deg, #A78BFA, #38BDF8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>KERNEL PHILOSOPHY</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568", maxWidth: 560, lineHeight: 1.7 }}>
          Three pillars that shape every decision in <span style={{ color: PURPLE }}>pw_kernel</span>
        </div>
      </div>

      {/* Pillar cards */}
      <div style={{
        width: "100%", maxWidth: 820,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {pillars.map((p) => {
          const isOpen = expanded === p.label;
          return (
            <div
              key={p.label}
              onClick={() => setExpanded(isOpen ? null : p.label)}
              style={{
                border: `1px solid ${isOpen ? p.color + "60" : DIM}`,
                borderRadius: 4,
                padding: "22px 28px",
                background: isOpen ? "#0D1320" : "#0A0F1A",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.25s ease",
                boxShadow: isOpen ? `0 0 16px ${p.color}18` : "none",
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: 2,
                background: `linear-gradient(90deg, transparent, ${p.color}80, transparent)`,
              }} />

              {/* Title row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, letterSpacing: 4, color: p.color, fontWeight: 700 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 10, color: "#4A5568", letterSpacing: 2, marginTop: 2 }}>
                      {p.tagline}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: "#4A5568", transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "none" }}>
                  ▶
                </div>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${DIM}` }}>
                  {/* Quote */}
                  <div style={{
                    fontSize: 12, color: TEXT, lineHeight: 1.8,
                    fontStyle: "italic", marginBottom: 18,
                    paddingLeft: 16,
                    borderLeft: `2px solid ${p.color}50`,
                  }}>
                    "{p.quote}"
                  </div>

                  {/* Key points */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {p.details.map((d, i) => (
                      <div key={i} style={{
                        fontSize: 10, color: TEXT, lineHeight: 1.6,
                        padding: "8px 12px", background: `${p.color}08`,
                        border: `1px solid ${p.color}18`, borderRadius: 3,
                        letterSpacing: 0.5,
                      }}>
                        <span style={{ color: p.color, marginRight: 6 }}>▸</span>{d}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom insight */}
      <div style={{
        marginTop: 32, width: "100%", maxWidth: 820,
        border: `1px solid ${PURPLE}30`, borderRadius: 4,
        padding: "14px 24px", background: `${PURPLE}08`,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: PURPLE, fontWeight: 700, marginBottom: 4 }}>
          CLICK EACH CARD TO EXPAND
        </div>
        <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
          These three pillars aren't just goals — they are <span style={{ color: PURPLE, fontWeight: 700 }}>hard constraints</span> that
          shape the kernel's architecture, API surface, and build configuration.
        </div>
      </div>
    </div>
  );
}
