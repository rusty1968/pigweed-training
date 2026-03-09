import { useState } from "react";

const BAZEL = "#00FFB2";
const RUST = "#CE422B";
const PURPLE = "#A78BFA";
const BLUE = "#38BDF8";
const ORANGE = "#FF6B35";
const YELLOW = "#FBBF24";
const DIM = "#1A2235";
const TEXT = "#94A3B8";
const BG = "#080C14";

const objectTypes = [
  {
    id: "channel-init",
    label: "ChannelInitiator",
    color: BLUE,
    signals: ["WRITABLE", "READABLE", "USER"],
    desc: "Sends requests to a handler and waits for responses.",
  },
  {
    id: "channel-handler",
    label: "ChannelHandler",
    color: ORANGE,
    signals: ["READABLE", "WRITABLE", "USER"],
    desc: "Receives requests from an initiator and sends responses.",
  },
  {
    id: "wait-group",
    label: "WaitGroup",
    color: PURPLE,
    signals: ["READABLE"],
    desc: "Aggregates signals from multiple objects. Like epoll.",
  },
  {
    id: "interrupt",
    label: "Interrupt",
    color: RUST,
    signals: ["IRQ_A..IRQ_O"],
    desc: "Maps hardware IRQs to userspace handlers. Up to 16 per object.",
  },
];

export default function KernelObjects() {
  const [active, setActive] = useState(null);

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 10 }}>
          pw_kernel FUNDAMENTALS
        </div>
        <div style={{
          fontSize: 32, fontWeight: 900, letterSpacing: 6,
          background: "linear-gradient(135deg, #A78BFA, #38BDF8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 6,
        }}>KERNEL OBJECTS</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568" }}>
          THE BUILDING BLOCKS OF pw_kernel
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 780 }}>
        {/* ObjectBase diagram */}
        <div style={{
          border: `1px solid ${DIM}`, borderRadius: 4,
          padding: "24px 28px", background: "#0D1320",
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 16, textAlign: "center" }}>
            EVERY KERNEL OBJECT SHARES AN ObjectBase
          </div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 20 }}>
            {[
              { label: "active_signals", desc: "Current signal state (bitflags)", color: BAZEL },
              { label: "waiters", desc: "Threads blocked on this object", color: BLUE },
              { label: "wait_group_link", desc: "Membership in a wait group", color: PURPLE },
            ].map((field) => (
              <div key={field.label} style={{
                border: `1px solid ${field.color}30`, borderRadius: 3,
                padding: "10px 14px", background: `${field.color}08`,
                flex: 1,
              }}>
                <div style={{ fontSize: 10, color: field.color, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
                  {field.label}
                </div>
                <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>{field.desc}</div>
              </div>
            ))}
          </div>

          {/* Signal flow */}
          <div style={{
            borderTop: `1px solid ${DIM}`, paddingTop: 16,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
          }}>
            <div style={{
              border: `1px solid ${BAZEL}30`, borderRadius: 3,
              padding: "6px 14px", background: `${BAZEL}08`,
              fontSize: 10, color: BAZEL, letterSpacing: 2,
            }}>signal()</div>
            <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${BAZEL}, ${BLUE})` }} />
            <div style={{ fontSize: 10, color: TEXT }}>updates active_signals</div>
            <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${BLUE}, ${YELLOW})` }} />
            <div style={{
              border: `1px solid ${YELLOW}30`, borderRadius: 3,
              padding: "6px 14px", background: `${YELLOW}08`,
              fontSize: 10, color: YELLOW, letterSpacing: 2,
            }}>wakes waiters</div>
          </div>
        </div>

        {/* Object type cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {objectTypes.map((obj) => (
            <div
              key={obj.id}
              onClick={() => setActive(active === obj.id ? null : obj.id)}
              style={{
                border: `1px solid ${active === obj.id ? obj.color : DIM}`,
                borderRadius: 4, cursor: "pointer",
                background: active === obj.id ? `${obj.color}10` : "#0D1320",
                transition: "all 0.2s",
                boxShadow: active === obj.id ? `0 0 16px ${obj.color}25` : "none",
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: obj.color, boxShadow: `0 0 8px ${obj.color}`,
                }} />
                <div style={{ fontSize: 11, letterSpacing: 3, color: obj.color, fontWeight: 700 }}>
                  {obj.label}
                </div>
              </div>
              <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6, marginBottom: 8 }}>
                {obj.desc}
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {obj.signals.map((sig) => (
                  <div key={sig} style={{
                    fontSize: 9, letterSpacing: 1, color: "#4A5568",
                    background: "#0A0F1A", border: "1px solid #1E2D45",
                    borderRadius: 2, padding: "2px 6px",
                  }}>{sig}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Key principles */}
        <div style={{ display: "flex", gap: 12 }}>
          {[
            {
              label: "ZERO ALLOCATION",
              color: BAZEL,
              desc: "All objects pre-allocated at build time via system.json5. No runtime creation.",
            },
            {
              label: "HANDLES",
              color: PURPLE,
              desc: "Userspace references objects by u32 handle — an index into the process's object table.",
            },
            {
              label: "INTRUSIVE LISTS",
              color: BLUE,
              desc: "Waiter lists, process links — all embedded in the object. No separate allocations.",
            },
          ].map((p) => (
            <div key={p.label} style={{
              flex: 1, border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "14px 16px", background: "#0D1320",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: 2,
                background: `linear-gradient(90deg, transparent, ${p.color}60, transparent)`,
              }} />
              <div style={{ fontSize: 9, letterSpacing: 3, color: p.color, fontWeight: 700, marginBottom: 6 }}>
                {p.label}
              </div>
              <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 28, fontSize: 9, letterSpacing: 3, color: "#1E2D45", textAlign: "center" }}>
        CLICK ANY OBJECT TYPE TO HIGHLIGHT · pw_kernel OBJECTS
      </div>
    </div>
  );
}
