import { useState } from "react";

const BG = "#080C14";
const BLUE = "#38BDF8";
const PURPLE = "#A78BFA";
const ORANGE = "#FF6B35";
const BAZEL = "#00FFB2";
const RUST = "#CE422B";
const DIM = "#1A2235";
const TEXT = "#94A3B8";

function CodeBlock({ code }) {
  return (
    <pre style={{
      margin: 0, padding: "14px 16px",
      background: "#050810", border: `1px solid ${DIM}`,
      borderRadius: 3, fontSize: 11, lineHeight: 1.8, overflowX: "auto",
    }}>
      {code.split("\n").map((line, i) => {
        const isComment = line.trim().startsWith("//");
        const isSyscall = /syscall::/.test(line);
        const isKeyword = /^\s*(pub|fn|let|struct|impl|match|loop|if|else|use|mod|type)\b/.test(line);
        const isType = /I2c\w+|ResponseCode|Signals|Instant/.test(line);
        const isHandle = /handle::/.test(line);
        return (
          <div key={i} style={{
            color: isComment ? "#334155" : isSyscall ? BLUE : isHandle ? PURPLE
              : isType ? ORANGE : isKeyword ? RUST : TEXT,
            fontStyle: isComment ? "italic" : "normal",
          }}>{line || "\u00A0"}</div>
        );
      })}
    </pre>
  );
}

/* ── Five-crate architecture diagram data ── */
const crateData = [
  { name: "i2c_api", kind: "rust_library", kernel: false, color: PURPLE,
    purpose: "Types, traits, wire format shared by client and server" },
  { name: "i2c_client", kind: "rust_library", kernel: true, color: BLUE,
    purpose: "Translates method calls into IPC round-trips" },
  { name: "i2c_backend_aspeed", kind: "rust_library", kernel: false, color: RUST,
    purpose: "Translates server requests into MMIO register accesses" },
  { name: "i2c_server", kind: "rust_binary", kernel: true, color: ORANGE,
    purpose: "Dispatch loop: receive IPC → call backend → respond" },
  { name: "i2c_client_test", kind: "rust_binary", kernel: true, color: BAZEL,
    purpose: "Integration test exercising the full IPC stack" },
];

export default function DriverArchitecture() {
  const [tab, setTab] = useState("crates");

  const tabs = [
    { id: "crates", label: "5 CRATES" },
    { id: "wire", label: "WIRE PROTOCOL" },
    { id: "types", label: "CLIENT TYPES" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 10 }}>
          MODULES 1 – 3
        </div>
        <div style={{
          fontSize: 34, fontWeight: 900, letterSpacing: 6,
          background: "linear-gradient(135deg, #38BDF8, #A78BFA)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>SERVICE CRATE ARCHITECTURE</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568", maxWidth: 560, lineHeight: 1.7 }}>
          Architecture, wire protocol, and <span style={{ color: PURPLE }}>type-safe client types</span>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? `${BLUE}18` : "none",
            border: `1px solid ${tab === t.id ? BLUE + "60" : DIM}`,
            color: tab === t.id ? BLUE : "#4A5568",
            fontSize: 10, letterSpacing: 3, fontWeight: 700,
            padding: "8px 18px", borderRadius: 3, cursor: "pointer",
            fontFamily: "'Courier New', monospace", transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 820 }}>

        {/* ── 5 CRATES TAB ── */}
        {tab === "crates" && (
          <div>
            {/* Architecture diagram */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320", marginBottom: 16,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 16, textAlign: "center" }}>
                3 LIBRARIES + 2 BINARIES
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 0 }}>
                {/* Client side */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{
                    border: `1px solid ${BAZEL}40`, borderRadius: 4,
                    padding: "10px 16px", background: `${BAZEL}08`, textAlign: "center", minWidth: 130,
                  }}>
                    <div style={{ fontSize: 10, color: BAZEL, fontWeight: 700, letterSpacing: 2 }}>i2c_client_test</div>
                    <div style={{ fontSize: 9, color: TEXT }}>binary — app</div>
                  </div>
                  <div style={{ fontSize: 8, color: "#334155" }}>uses ↓</div>
                  <div style={{
                    border: `1px solid ${BLUE}40`, borderRadius: 4,
                    padding: "10px 16px", background: `${BLUE}08`, textAlign: "center", minWidth: 130,
                  }}>
                    <div style={{ fontSize: 10, color: BLUE, fontWeight: 700, letterSpacing: 2 }}>i2c_client</div>
                    <div style={{ fontSize: 9, color: TEXT }}>library</div>
                  </div>
                  <div style={{ fontSize: 8, color: "#334155" }}>uses ↓</div>
                  <div style={{
                    border: `1px solid ${PURPLE}40`, borderRadius: 4,
                    padding: "10px 16px", background: `${PURPLE}08`, textAlign: "center", minWidth: 130,
                  }}>
                    <div style={{ fontSize: 10, color: PURPLE, fontWeight: 700, letterSpacing: 2 }}>i2c_api</div>
                    <div style={{ fontSize: 9, color: TEXT }}>library (no kernel)</div>
                  </div>
                </div>
                {/* IPC arrows */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 14px", paddingTop: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: BAZEL }}>IPC</div>
                  <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, ${BAZEL}, ${ORANGE})` }} />
                  <div style={{ fontSize: 10, color: ORANGE }}>&#9654;</div>
                  <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, ${ORANGE}, ${BAZEL})` }} />
                  <div style={{ fontSize: 10, color: BAZEL }}>&#9664;</div>
                </div>
                {/* Server side */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{
                    border: `1px solid ${ORANGE}40`, borderRadius: 4,
                    padding: "10px 16px", background: `${ORANGE}08`, textAlign: "center", minWidth: 130,
                  }}>
                    <div style={{ fontSize: 10, color: ORANGE, fontWeight: 700, letterSpacing: 2 }}>i2c_server</div>
                    <div style={{ fontSize: 9, color: TEXT }}>binary — app</div>
                  </div>
                  <div style={{ fontSize: 8, color: "#334155" }}>uses ↓</div>
                  <div style={{
                    border: `1px solid ${RUST}40`, borderRadius: 4,
                    padding: "10px 16px", background: `${RUST}08`, textAlign: "center", minWidth: 130,
                  }}>
                    <div style={{ fontSize: 10, color: RUST, fontWeight: 700, letterSpacing: 2 }}>i2c_backend</div>
                    <div style={{ fontSize: 9, color: TEXT }}>aspeed DDK</div>
                  </div>
                  <div style={{ fontSize: 8, color: "#334155" }}>wraps ↓</div>
                  <div style={{
                    border: `1px solid ${DIM}`, borderRadius: 4,
                    padding: "10px 16px", background: "#0A0F1A", textAlign: "center", minWidth: 130,
                  }}>
                    <div style={{ fontSize: 10, color: TEXT, fontWeight: 700, letterSpacing: 2 }}>aspeed-ddk</div>
                    <div style={{ fontSize: 9, color: "#334155" }}>Ast1060I2c</div>
                  </div>
                </div>
              </div>
              {/* Cross-dependency note */}
              <div style={{
                marginTop: 14, paddingTop: 10, borderTop: `1px solid ${DIM}`,
                fontSize: 10, color: TEXT, textAlign: "center",
              }}>
                <span style={{ color: ORANGE }}>i2c_server</span> also depends on{" "}
                <span style={{ color: PURPLE }}>i2c_api</span> — both binaries share the wire types
              </div>
            </div>
            {/* Crate cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {crateData.map((c) => (
                <div key={c.name} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  border: `1px solid ${DIM}`, borderRadius: 4,
                  padding: "10px 16px", background: "#0D1320",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: c.color, boxShadow: `0 0 8px ${c.color}`,
                  }} />
                  <div style={{ minWidth: 160 }}>
                    <span style={{ fontSize: 11, color: c.color, fontWeight: 700 }}>{c.name}</span>
                    <span style={{ fontSize: 9, color: "#334155", marginLeft: 8 }}>{c.kind}</span>
                  </div>
                  <div style={{
                    fontSize: 9, padding: "2px 8px", borderRadius: 3,
                    background: c.kernel ? `${PURPLE}15` : `${BAZEL}15`,
                    color: c.kernel ? PURPLE : BAZEL,
                    border: `1px solid ${c.kernel ? PURPLE : BAZEL}30`,
                  }}>{c.kernel ? "KERNEL" : "HOST OK"}</div>
                  <div style={{ fontSize: 10, color: TEXT, flex: 1 }}>{c.purpose}</div>
                </div>
              ))}
            </div>
            {/* Key principle */}
            <div style={{ marginTop: 14, border: `1px solid ${BAZEL}30`, borderRadius: 4, padding: "12px 20px", background: `${BAZEL}08` }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: BAZEL, fontWeight: 700, marginBottom: 4 }}>KEY PRINCIPLE</div>
              <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
                The <span style={{ color: PURPLE }}>API crate has zero kernel dependencies</span>. It compiles and tests
                on the host with <span style={{ color: BAZEL }}>rust_test</span>. Iterate on wire protocol and types without touching firmware.
              </div>
            </div>
          </div>
        )}

        {/* ── WIRE PROTOCOL TAB ── */}
        {tab === "wire" && (
          <div>
            {/* Header layout */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14, textAlign: "center" }}>
                REQUEST HEADER (8 bytes + payload)
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 16 }}>
                {[
                  { label: "op", size: "1B", color: ORANGE },
                  { label: "bus", size: "1B", color: BLUE },
                  { label: "addr", size: "1B", color: PURPLE },
                  { label: "rsv", size: "1B", color: "#334155" },
                  { label: "write_len", size: "2B", color: RUST },
                  { label: "read_len", size: "2B", color: BAZEL },
                ].map((f, i) => (
                  <div key={i} style={{
                    border: `1px solid ${f.color}60`, padding: "8px 12px",
                    background: `${f.color}10`, textAlign: "center",
                    borderRadius: i === 0 ? "4px 0 0 4px" : i === 5 ? "0 4px 4px 0" : 0,
                  }}>
                    <div style={{ fontSize: 10, color: f.color, fontWeight: 700 }}>{f.label}</div>
                    <div style={{ fontSize: 8, color: TEXT }}>{f.size}</div>
                  </div>
                ))}
                <div style={{
                  border: `1px dashed ${DIM}`, padding: "8px 16px",
                  background: "#050810", textAlign: "center", borderRadius: "0 4px 4px 0",
                }}>
                  <div style={{ fontSize: 10, color: TEXT }}>payload...</div>
                  <div style={{ fontSize: 8, color: "#334155" }}>var</div>
                </div>
              </div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14, textAlign: "center" }}>
                RESPONSE HEADER (4 bytes + payload)
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 0 }}>
                {[
                  { label: "code", size: "1B", color: ORANGE },
                  { label: "rsv", size: "1B", color: "#334155" },
                  { label: "data_len", size: "2B", color: BAZEL },
                ].map((f, i) => (
                  <div key={i} style={{
                    border: `1px solid ${f.color}60`, padding: "8px 12px",
                    background: `${f.color}10`, textAlign: "center",
                    borderRadius: i === 0 ? "4px 0 0 4px" : 0,
                  }}>
                    <div style={{ fontSize: 10, color: f.color, fontWeight: 700 }}>{f.label}</div>
                    <div style={{ fontSize: 8, color: TEXT }}>{f.size}</div>
                  </div>
                ))}
                <div style={{
                  border: `1px dashed ${DIM}`, padding: "8px 16px",
                  background: "#050810", textAlign: "center", borderRadius: "0 4px 4px 0",
                }}>
                  <div style={{ fontSize: 10, color: TEXT }}>read data...</div>
                  <div style={{ fontSize: 8, color: "#334155" }}>var</div>
                </div>
              </div>
            </div>
            {/* Operation codes */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "18px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>OPERATION CODES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Write=0", "Read=1", "WriteRead=2", "Transaction=3", "Probe=4", "ConfigureSpeed=5", "RecoverBus=6"].map((op) => {
                  const [name, val] = op.split("=");
                  return (
                    <div key={op} style={{
                      padding: "6px 12px", border: `1px solid ${ORANGE}30`,
                      borderRadius: 3, background: `${ORANGE}08`,
                    }}>
                      <span style={{ fontSize: 10, color: ORANGE, fontWeight: 700 }}>{name}</span>
                      <span style={{ fontSize: 9, color: TEXT, marginLeft: 6 }}>0x{parseInt(val).toString(16).padStart(2, "0")}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Design rules */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { rule: "FIXED HEADERS", desc: "No allocation; parse with from_bytes on a stack buffer", color: BLUE },
                { rule: "LITTLE-ENDIAN", desc: "ARM is LE — avoids byte-swap on target", color: PURPLE },
                { rule: "MAX 256 PAYLOAD", desc: "Fits comfortably in pw_kernel's channel buffer", color: BAZEL },
                { rule: "SEPARATE ERRORS", desc: "WireError for encoding, ResponseCode for hardware", color: RUST },
              ].map((r) => (
                <div key={r.rule} style={{
                  padding: "12px 16px", border: `1px solid ${DIM}`, borderRadius: 4,
                  background: "#0D1320", position: "relative",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${r.color}60, transparent)` }} />
                  <div style={{ fontSize: 10, letterSpacing: 3, color: r.color, fontWeight: 700, marginBottom: 4 }}>{r.rule}</div>
                  <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLIENT TYPES TAB ── */}
        {tab === "types" && (
          <div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                TYPE-SAFE ADDRESS VALIDATION
              </div>
              <CodeBlock code={`pub const fn new(addr: u8) -> Result<Self, AddressError> {
    if addr > 0x7F { return Err(AddressError::OutOfRange(addr)); }
    if addr <= 0x07 || addr >= 0x78 {
        return Err(AddressError::Reserved(addr));
    }
    Ok(I2cAddress(addr))  // valid once, safe everywhere
}`} />
            </div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                I2cClient TRAIT — THE SERVICE CONTRACT
              </div>
              <CodeBlock code={`pub trait I2cClient: ErrorType {
    fn write_read(
        &mut self, bus: BusIndex, address: I2cAddress,
        write: &[u8], read: &mut [u8],
    ) -> Result<usize, Self::Error>;

    fn transaction(
        &mut self, bus: BusIndex, address: I2cAddress,
        operations: &mut [Operation<'_>],
    ) -> Result<(), Self::Error>;
}
// Blanket impl: write, read, probe, read_register...  FREE`} />
            </div>
            {/* Error domains */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "18px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                ERROR LAYERS
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
                {[
                  { label: "ResponseCode", desc: "Wire value from server", color: ORANGE },
                  { label: "I2cError", desc: "Client-facing error", color: PURPLE },
                  { label: "I2cErrorKind", desc: "embedded-hal compatible", color: BLUE },
                ].map((e, i) => (
                  <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                    <div style={{
                      border: `1px solid ${e.color}40`, borderRadius: 4,
                      padding: "10px 14px", background: `${e.color}08`, textAlign: "center", minWidth: 130,
                    }}>
                      <div style={{ fontSize: 10, color: e.color, fontWeight: 700 }}>{e.label}</div>
                      <div style={{ fontSize: 9, color: TEXT }}>{e.desc}</div>
                    </div>
                    {i < 2 && <div style={{ fontSize: 10, color: "#334155", padding: "0 8px" }}>→</div>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ border: `1px solid ${BAZEL}30`, borderRadius: 4, padding: "12px 20px", background: `${BAZEL}08` }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: BAZEL, fontWeight: 700, marginBottom: 4 }}>DESIGN PATTERN</div>
              <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
                Separate <span style={{ color: PURPLE }}>traits from transport</span>.{" "}
                <span style={{ color: BLUE }}>I2cClient</span> says what operations exist — nothing about IPC.
                Implement with a mock for tests, USB bridge for host tooling, or direct registers for monolithic FW.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
