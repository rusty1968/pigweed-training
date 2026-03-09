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
        const isKeyword = /^\s*(pub|fn|let|struct|impl|match|loop|if|else|return|mut)\b/.test(line);
        const isType = /I2c\w+|ResponseCode|Signals|Instant|AspeedI2c|Ast1060/.test(line);
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

export default function DriverImplementation() {
  const [tab, setTab] = useState("backend");

  const tabs = [
    { id: "backend", label: "BACKEND" },
    { id: "server", label: "SERVER LOOP" },
    { id: "client", label: "IPC CLIENT" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 10 }}>
          MODULES 4 – 6
        </div>
        <div style={{
          fontSize: 34, fontWeight: 900, letterSpacing: 6,
          background: "linear-gradient(135deg, #CE422B, #FF6B35)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>IMPLEMENTATION</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568", maxWidth: 560, lineHeight: 1.7 }}>
          Backend hardware adapter, <span style={{ color: ORANGE }}>server dispatch loop</span>, and IPC client
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? `${ORANGE}18` : "none",
            border: `1px solid ${tab === t.id ? ORANGE + "60" : DIM}`,
            color: tab === t.id ? ORANGE : "#4A5568",
            fontSize: 10, letterSpacing: 3, fontWeight: 700,
            padding: "8px 18px", borderRadius: 3, cursor: "pointer",
            fontFamily: "'Courier New', monospace", transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 820 }}>

        {/* ── BACKEND TAB ── */}
        {tab === "backend" && (
          <div>
            {/* Two-layer init */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                TWO-LAYER INITIALIZATION
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, border: `1px solid ${RUST}30`, borderRadius: 4, padding: "12px 16px", background: `${RUST}06` }}>
                  <div style={{ fontSize: 10, color: RUST, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>PLATFORM</div>
                  <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.7 }}>
                    SCU reset release, I2CG global regs, pin mux<br />
                    <span style={{ color: "#334155" }}>Runs at kernel boot (entry.rs)</span>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#334155", alignSelf: "center" }}>→</div>
                <div style={{ flex: 1, border: `1px solid ${ORANGE}30`, borderRadius: 4, padding: "12px 16px", background: `${ORANGE}06` }}>
                  <div style={{ fontSize: 10, color: ORANGE, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>PER-BUS</div>
                  <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.7 }}>
                    I2CC00 controller-local reset, timing, IRQ<br />
                    <span style={{ color: "#334155" }}>Runs at server startup</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Fast path code */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                PER-OPERATION FAST PATH — from_initialized() = ZERO register writes
              </div>
              <CodeBlock code={`pub fn write(&mut self, bus: u8, addr: u8, data: &[u8])
    -> Result<(), ResponseCode>
{
    if !self.is_bus_initialized(bus) {
        return Err(ResponseCode::ServerError);
    }
    let (regs, buffs) = self.controller_regs(bus)?;
    // from_initialized(): NO register writes
    // Reuses init from init_bus() — ~50x faster
    let mut i2c = Ast1060I2c::from_initialized(&ctrl, ...);
    i2c.write(addr, data).map_err(map_i2c_error)
}`} />
            </div>
            {/* Error mapping */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320",
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                ERROR MAPPING — hardware → wire code
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  ["NoAcknowledge", "NoDevice"],
                  ["ArbitrationLoss", "ArbitrationLost"],
                  ["Timeout", "Timeout"],
                  ["Busy", "Busy"],
                  ["InvalidAddress", "InvalidAddress"],
                  ["BusRecoveryFailed", "BusStuck"],
                  ["Bus | Overrun | Abnormal", "IoError"],
                  ["Invalid", "ServerError"],
                ].map(([hw, wire]) => (
                  <div key={hw} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10 }}>
                    <span style={{ color: RUST, minWidth: 160 }}>{hw}</span>
                    <span style={{ color: "#334155" }}>→</span>
                    <span style={{ color: ORANGE }}>{wire}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SERVER LOOP TAB ── */}
        {tab === "server" && (
          <div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                THE THREE-SYSCALL PATTERN
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {[
                  { n: "1", label: "WAIT", desc: "object_wait(READABLE)", color: PURPLE },
                  { n: "2", label: "READ", desc: "channel_read()", color: BLUE },
                  { n: "3", label: "RESPOND", desc: "dispatch → channel_respond()", color: BAZEL },
                ].map((s) => (
                  <div key={s.n} style={{
                    flex: 1, border: `1px solid ${s.color}30`, borderRadius: 4,
                    padding: "12px 14px", background: `${s.color}06`, textAlign: "center",
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      border: `1px solid ${s.color}60`, background: `${s.color}15`,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: s.color, fontWeight: 700, marginBottom: 6,
                    }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: s.color, fontWeight: 700, letterSpacing: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 9, color: TEXT, marginTop: 2 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
              <CodeBlock code={`loop {
    // 1. Block until client sends a request
    syscall::object_wait(handle::I2C, Signals::READABLE, Instant::MAX)?;

    // 2. Copy the request into server RAM
    let len = syscall::channel_read(handle::I2C, 0, &mut request_buf)?;

    // 3. Dispatch and respond
    let response_len = dispatch_i2c_op(
        &request_buf[..len], &mut response_buf, &mut backend);
    syscall::channel_respond(handle::I2C, &response_buf[..response_len])?;
}`} />
            </div>
            {/* Zero-copy read path */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320",
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                ZERO-COPY READ PATH — data goes directly into response buffer
              </div>
              <CodeBlock code={`I2cOp::Read => {
    let rlen = header.read_len as usize;
    let read_buf = &mut response[
        I2cResponseHeader::SIZE..I2cResponseHeader::SIZE + rlen];
    backend.read(header.bus, header.address, read_buf)?;
    encode_success(response, rlen)  // header before data already in place
}`} />
              <div style={{ marginTop: 10, fontSize: 10, color: BAZEL, fontStyle: "italic" }}>
                No intermediate buffer, no copy — hardware reads directly into the response.
              </div>
            </div>
          </div>
        )}

        {/* ── IPC CLIENT TAB ── */}
        {tab === "client" && (
          <div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                CLIENT STRUCT — stack-allocated buffers
              </div>
              <CodeBlock code={`pub struct IpcI2cClient {
    handle: u32,                             // IPC channel handle
    request_buf: [u8; MAX_REQUEST_SIZE],     // 264 bytes on stack
    response_buf: [u8; MAX_RESPONSE_SIZE],   // 260 bytes on stack
}`} />
            </div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                IPC ROUND-TRIP — one syscall does send + block + receive
              </div>
              <CodeBlock code={`fn send_recv(&mut self, req_len: usize) -> Result<usize, I2cError> {
    syscall::channel_transact(
        self.handle,
        &self.request_buf[..req_len],
        &mut self.response_buf,
        Instant::MAX,          // blocking call
    )
    .map_err(|_| I2cError::from_code(ResponseCode::ServerError))
}`} />
            </div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                WRITE_READ DISPATCH — choose wire op by buffer state
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { cond: "write=[] read=[]", op: "Probe", color: PURPLE },
                  { cond: "write=[] read=[n]", op: "Read", color: BLUE },
                  { cond: "write=[n] read=[]", op: "Write", color: ORANGE },
                  { cond: "write=[n] read=[m]", op: "WriteRead", color: BAZEL },
                ].map((r) => (
                  <div key={r.op} style={{
                    flex: 1, border: `1px solid ${r.color}30`, borderRadius: 4,
                    padding: "10px 12px", background: `${r.color}06`, textAlign: "center",
                  }}>
                    <div style={{ fontSize: 9, color: TEXT, marginBottom: 4 }}>{r.cond}</div>
                    <div style={{ fontSize: 11, color: r.color, fontWeight: 700 }}>{r.op}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Error translation */}
            <div style={{
              border: `1px solid ${RUST}30`, borderRadius: 4,
              padding: "12px 20px", background: `${RUST}08`,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: RUST, fontWeight: 700, marginBottom: 4 }}>ERROR TRANSLATION</div>
              <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
                Two domains merge: <span style={{ color: ORANGE }}>WireError</span> (encode/decode) and{" "}
                <span style={{ color: PURPLE }}>ResponseCode</span> (server-side) both map to{" "}
                <span style={{ color: BLUE }}>I2cError</span> with embedded-hal <span style={{ color: BAZEL }}>ErrorKind</span>.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
