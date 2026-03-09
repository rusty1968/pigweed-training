const BAZEL = "#00FFB2";
const RUST = "#CE422B";
const PURPLE = "#A78BFA";
const BLUE = "#38BDF8";
const ORANGE = "#FF6B35";
const DIM = "#1A2235";
const TEXT = "#94A3B8";
const BG = "#080C14";

export default function ChannelOverview() {
  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 10 }}>
          pw_kernel IPC
        </div>
        <div style={{
          fontSize: 36, fontWeight: 900, letterSpacing: 8,
          background: "linear-gradient(135deg, #A78BFA, #38BDF8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>CHANNELS</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568", maxWidth: 520, lineHeight: 1.7 }}>
          Zero-allocation, single-transaction IPC between processes.
          <br />One initiator sends, one handler responds — no buffering in the kernel.
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 780 }}>
        {/* Visual diagram: Initiator ↔ Channel ↔ Handler */}
        <div style={{
          border: `1px solid ${DIM}`, borderRadius: 4,
          padding: "28px 32px", background: "#0D1320",
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 20, textAlign: "center" }}>
            TRANSACTION LIFECYCLE
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
            {/* Initiator */}
            <div style={{
              border: `1px solid ${BLUE}40`, borderRadius: 4,
              padding: "16px 20px", background: `${BLUE}08`,
              minWidth: 160, textAlign: "center",
            }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700, marginBottom: 8 }}>
                INITIATOR
              </div>
              <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>
                App A<br />
                <span style={{ color: BLUE }}>channel_transact()</span>
              </div>
            </div>

            {/* Arrow: send */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 8px" }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: BAZEL }}>send_data</div>
              <div style={{
                width: 80, height: 1,
                background: `linear-gradient(90deg, ${BLUE}, ${PURPLE})`,
              }} />
              <div style={{ fontSize: 10, color: PURPLE }}>&#9654;</div>
            </div>

            {/* Channel */}
            <div style={{
              border: `1px solid ${PURPLE}60`, borderRadius: 4,
              padding: "16px 20px", background: `${PURPLE}10`,
              minWidth: 140, textAlign: "center",
              boxShadow: `0 0 20px ${PURPLE}15`,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: PURPLE, fontWeight: 700, marginBottom: 8 }}>
                CHANNEL
              </div>
              <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>
                No kernel buffer<br />
                <span style={{ color: "#4A5568" }}>Direct copy</span>
              </div>
            </div>

            {/* Arrow: receive */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 8px" }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: ORANGE }}>response</div>
              <div style={{
                width: 80, height: 1,
                background: `linear-gradient(90deg, ${PURPLE}, ${ORANGE})`,
              }} />
              <div style={{ fontSize: 10, color: ORANGE }}>&#9654;</div>
            </div>

            {/* Handler */}
            <div style={{
              border: `1px solid ${ORANGE}40`, borderRadius: 4,
              padding: "16px 20px", background: `${ORANGE}08`,
              minWidth: 160, textAlign: "center",
            }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: ORANGE, fontWeight: 700, marginBottom: 8 }}>
                HANDLER
              </div>
              <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>
                App B<br />
                <span style={{ color: ORANGE }}>channel_read()</span><br />
                <span style={{ color: ORANGE }}>channel_respond()</span>
              </div>
            </div>
          </div>

          {/* Step labels */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 32,
            marginTop: 20, paddingTop: 16,
            borderTop: `1px solid ${DIM}`,
          }}>
            {[
              { n: "1", text: "Initiator sends data, blocks", color: BLUE },
              { n: "2", text: "Handler wakes, reads, responds", color: ORANGE },
              { n: "3", text: "Initiator wakes with response", color: BAZEL },
            ].map((step) => (
              <div key={step.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: `1px solid ${step.color}60`, background: `${step.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: step.color, fontWeight: 700,
                }}>{step.n}</div>
                <div style={{ fontSize: 10, color: TEXT, letterSpacing: 0.5 }}>{step.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Design principles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            {
              label: "ZERO ALLOCATION",
              color: BAZEL,
              desc: "All channels statically allocated at build time. No malloc, no heap, no surprises.",
            },
            {
              label: "SINGLE IN-FLIGHT",
              color: PURPLE,
              desc: "One transaction per channel at a time. Simplifies state, reduces memory footprint.",
            },
            {
              label: "DIRECT COPY",
              color: BLUE,
              desc: "Data copies directly between process buffers. No intermediate kernel storage.",
            },
          ].map((p) => (
            <div key={p.label} style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "16px 18px", background: "#0D1320",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: 2,
                background: `linear-gradient(90deg, transparent, ${p.color}60, transparent)`,
              }} />
              <div style={{
                fontSize: 10, letterSpacing: 3, color: p.color,
                fontWeight: 700, marginBottom: 8,
              }}>{p.label}</div>
              <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.7 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 28, fontSize: 9, letterSpacing: 3, color: "#1E2D45", textAlign: "center" }}>
        pw_kernel CHANNELS · OVERVIEW
      </div>
    </div>
  );
}
