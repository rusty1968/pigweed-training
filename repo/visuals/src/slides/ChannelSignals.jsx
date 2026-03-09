import { useState } from "react";

const BAZEL = "#00FFB2";
const RUST = "#CE422B";
const PURPLE = "#A78BFA";
const BLUE = "#38BDF8";
const ORANGE = "#FF6B35";
const DIM = "#1A2235";
const TEXT = "#94A3B8";
const BG = "#080C14";

const steps = [
  {
    label: "IDLE",
    desc: "No transaction in progress",
    initiator: { WRITABLE: true, READABLE: false },
    handler: { READABLE: false, WRITABLE: false },
    note: "Initiator is WRITABLE — ready to start a transaction",
  },
  {
    label: "TRANSACT",
    desc: "Initiator calls channel_transact()",
    initiator: { WRITABLE: false, READABLE: false },
    handler: { READABLE: true, WRITABLE: true },
    note: "Handler becomes READABLE + WRITABLE — data is available",
  },
  {
    label: "READ",
    desc: "Handler calls channel_read()",
    initiator: { WRITABLE: false, READABLE: false },
    handler: { READABLE: true, WRITABLE: true },
    note: "Handler reads directly from initiator's send buffer — no copy into kernel",
  },
  {
    label: "RESPOND",
    desc: "Handler calls channel_respond()",
    initiator: { WRITABLE: true, READABLE: true },
    handler: { READABLE: false, WRITABLE: false },
    note: "Response copied to initiator's recv buffer. Initiator wakes up with READABLE.",
  },
  {
    label: "COMPLETE",
    desc: "Initiator reads response, cycle done",
    initiator: { WRITABLE: true, READABLE: false },
    handler: { READABLE: false, WRITABLE: false },
    note: "Back to IDLE — channel ready for the next transaction",
  },
];

function SignalDot({ on, color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        background: on ? color : "#0A0F1A",
        border: `1px solid ${on ? color : "#1E2D45"}`,
        boxShadow: on ? `0 0 8px ${color}` : "none",
        transition: "all 0.3s",
      }} />
      <span style={{
        fontSize: 9, letterSpacing: 2,
        color: on ? color : "#2D3F55",
        fontWeight: on ? 700 : 400,
        transition: "all 0.3s",
      }}>{label}</span>
    </div>
  );
}

export default function ChannelSignals() {
  const [step, setStep] = useState(0);
  const current = steps[step];

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 10 }}>
          pw_kernel IPC
        </div>
        <div style={{
          fontSize: 32, fontWeight: 900, letterSpacing: 6,
          background: "linear-gradient(135deg, #A78BFA, #FF6B35)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 6,
        }}>SIGNAL STATE MACHINE</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568" }}>
          HOW SIGNALS COORDINATE THE TRANSACTION LIFECYCLE
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 780 }}>
        {/* Step selector */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 24,
          border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden",
        }}>
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              flex: 1, background: step === i ? `${PURPLE}12` : "transparent",
              border: "none",
              borderRight: i < steps.length - 1 ? `1px solid ${DIM}` : "none",
              borderBottom: step === i ? `2px solid ${PURPLE}` : "2px solid transparent",
              color: step === i ? PURPLE : "#334155",
              fontFamily: "'Courier New', monospace",
              fontSize: 9, letterSpacing: 2, padding: "10px 4px",
              cursor: "pointer", transition: "all 0.2s",
            }}>{s.label}</button>
          ))}
        </div>

        {/* Signal visualization */}
        <div style={{
          border: `1px solid ${DIM}`, borderRadius: 4,
          background: "#0D1320", overflow: "hidden", marginBottom: 16,
        }}>
          {/* Step description */}
          <div style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${DIM}`,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              border: `1px solid ${PURPLE}60`, background: `${PURPLE}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: PURPLE, fontWeight: 700,
            }}>{step + 1}</div>
            <div>
              <div style={{ fontSize: 12, color: PURPLE, fontWeight: 700, letterSpacing: 2 }}>
                {current.label}
              </div>
              <div style={{ fontSize: 10, color: TEXT, letterSpacing: 1, marginTop: 2 }}>
                {current.desc}
              </div>
            </div>
          </div>

          {/* Signal state display */}
          <div style={{ padding: "24px 28px", display: "flex", gap: 24 }}>
            {/* Initiator signals */}
            <div style={{
              flex: 1, border: `1px solid ${BLUE}30`, borderRadius: 4,
              padding: "16px 20px", background: `${BLUE}06`,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: BLUE, fontWeight: 700, marginBottom: 14 }}>
                INITIATOR SIGNALS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <SignalDot on={current.initiator.WRITABLE} color={BAZEL} label="WRITABLE" />
                <SignalDot on={current.initiator.READABLE} color={BLUE} label="READABLE" />
              </div>
            </div>

            {/* Center arrow */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 4,
            }}>
              <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${BLUE}, ${ORANGE})` }} />
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#334155" }}>CHANNEL</div>
              <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${BLUE}, ${ORANGE})` }} />
            </div>

            {/* Handler signals */}
            <div style={{
              flex: 1, border: `1px solid ${ORANGE}30`, borderRadius: 4,
              padding: "16px 20px", background: `${ORANGE}06`,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: ORANGE, fontWeight: 700, marginBottom: 14 }}>
                HANDLER SIGNALS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <SignalDot on={current.handler.READABLE} color={BAZEL} label="READABLE" />
                <SignalDot on={current.handler.WRITABLE} color={ORANGE} label="WRITABLE" />
              </div>
            </div>
          </div>

          {/* Note */}
          <div style={{
            padding: "12px 20px", borderTop: `1px solid ${DIM}`,
            background: "#050810",
          }}>
            <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7, letterSpacing: 0.3 }}>
              <span style={{ color: PURPLE, marginRight: 8 }}>&#9656;</span>
              {current.note}
            </div>
          </div>
        </div>

        {/* Key insight */}
        <div style={{
          border: `1px solid ${BAZEL}30`, borderRadius: 4,
          padding: "14px 20px", background: `${BAZEL}08`,
          display: "flex", gap: 16, alignItems: "flex-start",
        }}>
          <div style={{
            fontSize: 10, letterSpacing: 3, color: BAZEL, fontWeight: 700,
            minWidth: 100, paddingTop: 2,
          }}>KEY INSIGHT</div>
          <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
            Signals replace callbacks and condition variables. The scheduler uses them
            to block and wake threads — no polling, no spinlocks.
            Handler waits with <span style={{ color: ORANGE }}>object_wait(READABLE)</span>,
            initiator blocks inside <span style={{ color: BLUE }}>channel_transact()</span> until
            READABLE is raised.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28, fontSize: 9, letterSpacing: 3, color: "#1E2D45", textAlign: "center" }}>
        STEP THROUGH THE STATES · pw_kernel CHANNELS
      </div>
    </div>
  );
}
