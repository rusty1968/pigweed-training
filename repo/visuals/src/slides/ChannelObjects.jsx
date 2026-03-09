import { useState } from "react";

const BAZEL = "#00FFB2";
const RUST = "#CE422B";
const PURPLE = "#A78BFA";
const BLUE = "#38BDF8";
const ORANGE = "#FF6B35";
const DIM = "#1A2235";
const TEXT = "#94A3B8";
const BG = "#080C14";

/* ── Signal state machine data ── */
const signalSteps = [
  {
    label: "IDLE", desc: "No transaction in progress",
    initiator: { WRITABLE: true, READABLE: false, ERROR: false, USER: false },
    handler:   { READABLE: false, WRITABLE: false, ERROR: false, USER: false },
    note: "Initiator is WRITABLE — ready to start a transaction",
  },
  {
    label: "TRANSACT", desc: "Initiator calls channel_transact()",
    initiator: { WRITABLE: false, READABLE: false, ERROR: false, USER: false },
    handler:   { READABLE: true, WRITABLE: true, ERROR: false, USER: false },
    note: "Handler becomes READABLE + WRITABLE — data is available to read",
  },
  {
    label: "READ", desc: "Handler calls channel_read()",
    initiator: { WRITABLE: false, READABLE: false, ERROR: false, USER: false },
    handler:   { READABLE: true, WRITABLE: true, ERROR: false, USER: false },
    note: "Non-blocking read directly from initiator's send buffer — can call multiple times with offset",
  },
  {
    label: "RESPOND", desc: "Handler calls channel_respond()",
    initiator: { WRITABLE: true, READABLE: true, ERROR: false, USER: false },
    handler:   { READABLE: false, WRITABLE: false, ERROR: false, USER: false },
    note: "Response copied to initiator's recv_buffer. Initiator wakes with READABLE. Handler signals cleared.",
  },
  {
    label: "COMPLETE", desc: "Initiator reads response, cycle done",
    initiator: { WRITABLE: true, READABLE: false, ERROR: false, USER: false },
    handler:   { READABLE: false, WRITABLE: false, ERROR: false, USER: false },
    note: "Back to IDLE — channel ready for the next transaction",
  },
  {
    label: "USER SIG", desc: "Either peer calls object_raise_peer_user_signal()",
    initiator: { WRITABLE: true, READABLE: false, ERROR: false, USER: true },
    handler:   { READABLE: false, WRITABLE: false, ERROR: false, USER: true },
    note: "Out-of-band notification — USER signal set on the peer. Cleared when that object is waited on.",
  },
];

/* ── Code tab data ── */
const codeTabs = [
  {
    id: "initiator", label: "INITIATOR", color: BLUE,
    desc: "Sends data and blocks until response arrives",
    blocks: [
      { title: "SYNC TRANSACTION", code: `// Send request, block until handler responds
let bytes_received = syscall::channel_transact(
    handle::IPC,        // channel handle (generated)
    &send_buf,          // data to send
    &mut recv_buf,      // buffer for response
    Instant::MAX,       // deadline (no timeout)
)?;

// recv_buf[..bytes_received] contains the response` },
      { title: "ASYNC TRANSACTION", code: `// Start transaction without blocking
unsafe {
    syscall::channel_async_transact(
        handle::IPC,
        send_data.as_ptr(), send_data.len(),
        recv_data.as_mut_ptr(), recv_data.len(),
    ).await?;
}

// Later: check completion
let len = syscall::channel_async_transact_complete(
    handle::IPC
)?;` },
    ],
  },
  {
    id: "handler", label: "HANDLER", color: ORANGE,
    desc: "Waits for requests, reads data, sends response",
    blocks: [
      { title: "RECEIVE AND RESPOND", code: `loop {
    // Wait for an incoming transaction
    syscall::object_wait(
        handle::IPC,
        Signals::READABLE,
        Instant::MAX,
    )?;

    // Read the initiator's data (no copy into kernel)
    let len = syscall::channel_read(
        handle::IPC,
        0,              // offset into send buffer
        &mut buffer,
    )?;

    // Process the request...
    let response = process(&buffer[..len]);

    // Send response back (wakes initiator)
    syscall::channel_respond(
        handle::IPC,
        &response,
    )?;
}` },
    ],
  },
  {
    id: "config", label: "CONFIG", color: BAZEL,
    desc: "Static channel wiring in system.json5",
    blocks: [
      { title: "INITIATOR APP", code: `{
  name: "initiator",
  process: {
    objects: [
      {
        name: "IPC",
        type: "channel_initiator",
        handler_app: "handler",
        handler_object_name: "IPC",
      },
    ],
    threads: [
      { name: "main", stack_size_bytes: 2048 },
    ],
  },
}` },
      { title: "HANDLER APP", code: `{
  name: "handler",
  process: {
    objects: [
      { name: "IPC", type: "channel_handler" },
    ],
    threads: [
      { name: "main", stack_size_bytes: 2048 },
    ],
  },
}` },
    ],
  },
];

/* ── Helpers ── */
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

function CodeBlock({ code, accentColor }) {
  return (
    <pre style={{
      margin: 0, padding: "14px 16px",
      background: "#050810", border: `1px solid ${DIM}`,
      borderRadius: 3, fontSize: 11, lineHeight: 1.8, overflowX: "auto",
    }}>
      {code.split("\n").map((line, i) => {
        const isComment = line.trim().startsWith("//");
        const isSyscall = /syscall::/.test(line);
        const isHandle = /handle::/.test(line);
        const isSignal = /Signals::/.test(line);
        const isKeyword = /^\s*(let|loop|unsafe|await)\b/.test(line);
        return (
          <div key={i} style={{
            color: isComment ? "#334155" : isSyscall ? BLUE : isHandle ? PURPLE
              : isSignal ? ORANGE : isKeyword ? RUST : TEXT,
            fontStyle: isComment ? "italic" : "normal",
          }}>{line || "\u00A0"}</div>
        );
      })}
    </pre>
  );
}

/* ── Main component ── */
export default function ChannelObjects() {
  const [tab, setTab] = useState("overview");
  const [signalStep, setSignalStep] = useState(0);
  const [codeTab, setCodeTab] = useState(0);

  const mainTabs = [
    { id: "overview", label: "OVERVIEW" },
    { id: "signals",  label: "SIGNALS" },
    { id: "code",     label: "CODE" },
    { id: "kernel",   label: "KERNEL" },
    { id: "codegen",  label: "CODEGEN" },
  ];

  const currentSignal = signalSteps[signalStep];
  const currentCode = codeTabs[codeTab];

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 10 }}>
          pw_kernel IPC
        </div>
        <div style={{
          fontSize: 34, fontWeight: 900, letterSpacing: 6,
          background: "linear-gradient(135deg, #A78BFA, #38BDF8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>CHANNEL OBJECTS</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568", maxWidth: 560, lineHeight: 1.7 }}>
          <span style={{ color: PURPLE }}>Unidirectional, asymmetric</span> IPC.
          One initiator sends, one handler responds — <span style={{ color: BAZEL }}>zero-copy</span>, no kernel buffers.
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {mainTabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? `${PURPLE}18` : "none",
            border: `1px solid ${tab === t.id ? PURPLE + "60" : DIM}`,
            color: tab === t.id ? PURPLE : "#4A5568",
            fontSize: 10, letterSpacing: 3, fontWeight: 700,
            padding: "8px 18px", borderRadius: 3, cursor: "pointer",
            fontFamily: "'Courier New', monospace", transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 820 }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div>
            {/* Transaction diagram */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320", marginBottom: 16,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 20, textAlign: "center" }}>
                TRANSACTION LIFECYCLE
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
                {/* Initiator */}
                <div style={{
                  border: `1px solid ${BLUE}40`, borderRadius: 4,
                  padding: "14px 18px", background: `${BLUE}08`, minWidth: 140, textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700, marginBottom: 6 }}>INITIATOR</div>
                  <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>
                    App A<br /><span style={{ color: BLUE }}>channel_transact()</span>
                  </div>
                </div>
                {/* Arrow send */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 6px" }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: BAZEL }}>send_data</div>
                  <div style={{ width: 70, height: 1, background: `linear-gradient(90deg, ${BLUE}, ${PURPLE})` }} />
                  <div style={{ fontSize: 10, color: PURPLE }}>&#9654;</div>
                </div>
                {/* Channel */}
                <div style={{
                  border: `1px solid ${PURPLE}60`, borderRadius: 4,
                  padding: "14px 18px", background: `${PURPLE}10`, minWidth: 120, textAlign: "center",
                  boxShadow: `0 0 20px ${PURPLE}15`,
                }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, color: PURPLE, fontWeight: 700, marginBottom: 6 }}>CHANNEL</div>
                  <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>No kernel buffer<br /><span style={{ color: "#4A5568" }}>Direct copy</span></div>
                </div>
                {/* Arrow response */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 6px" }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: ORANGE }}>response</div>
                  <div style={{ width: 70, height: 1, background: `linear-gradient(90deg, ${PURPLE}, ${ORANGE})` }} />
                  <div style={{ fontSize: 10, color: ORANGE }}>&#9654;</div>
                </div>
                {/* Handler */}
                <div style={{
                  border: `1px solid ${ORANGE}40`, borderRadius: 4,
                  padding: "14px 18px", background: `${ORANGE}08`, minWidth: 140, textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, color: ORANGE, fontWeight: 700, marginBottom: 6 }}>HANDLER</div>
                  <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>
                    App B<br /><span style={{ color: ORANGE }}>channel_read()</span><br /><span style={{ color: ORANGE }}>channel_respond()</span>
                  </div>
                </div>
              </div>
              {/* Steps */}
              <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${DIM}` }}>
                {[
                  { n: "1", text: "Initiator sends data, blocks", color: BLUE },
                  { n: "2", text: "Handler wakes, reads, responds", color: ORANGE },
                  { n: "3", text: "Initiator wakes with response", color: BAZEL },
                ].map((s) => (
                  <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `1px solid ${s.color}60`, background: `${s.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: s.color, fontWeight: 700,
                    }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: TEXT, letterSpacing: 0.5 }}>{s.text}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Design principles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "ZERO ALLOCATION", color: BAZEL, desc: "Statically allocated at build time via Jinja codegen. No malloc, no heap." },
                { label: "SINGLE IN-FLIGHT", color: PURPLE, desc: "One transaction per channel. Handler must respond before next transact." },
                { label: "ZERO-COPY", color: BLUE, desc: "Data copies directly between process buffers during syscalls." },
                { label: "SYNC + ASYNC", color: ORANGE, desc: "channel_transact() blocks; channel_async_transact() returns immediately." },
              ].map((p) => (
                <div key={p.label} style={{
                  border: `1px solid ${DIM}`, borderRadius: 4,
                  padding: "14px 16px", background: "#0D1320", position: "relative",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${p.color}60, transparent)` }} />
                  <div style={{ fontSize: 10, letterSpacing: 3, color: p.color, fontWeight: 700, marginBottom: 6 }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.7 }}>{p.desc}</div>
                </div>
              ))}
            </div>
            {/* Out-of-band */}
            <div style={{ marginTop: 14, border: `1px solid ${RUST}30`, borderRadius: 4, padding: "12px 20px", background: `${RUST}08`, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: RUST, fontWeight: 700, minWidth: 100, paddingTop: 2 }}>OUT-OF-BAND</div>
              <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
                <span style={{ color: RUST }}>object_raise_peer_user_signal()</span> lets either peer
                notify the other outside the transact/respond flow.
              </div>
            </div>
          </div>
        )}

        {/* ── SIGNALS TAB ── */}
        {tab === "signals" && (
          <div>
            {/* Step selector */}
            <div style={{ display: "flex", gap: 0, marginBottom: 20, border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden" }}>
              {signalSteps.map((s, i) => (
                <button key={i} onClick={() => setSignalStep(i)} style={{
                  flex: 1, background: signalStep === i ? `${PURPLE}12` : "transparent",
                  border: "none", borderRight: i < signalSteps.length - 1 ? `1px solid ${DIM}` : "none",
                  borderBottom: signalStep === i ? `2px solid ${PURPLE}` : "2px solid transparent",
                  color: signalStep === i ? PURPLE : "#334155",
                  fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2,
                  padding: "10px 4px", cursor: "pointer", transition: "all 0.2s",
                }}>{s.label}</button>
              ))}
            </div>
            {/* Signal visualization */}
            <div style={{ border: `1px solid ${DIM}`, borderRadius: 4, background: "#0D1320", overflow: "hidden", marginBottom: 14 }}>
              {/* Step description */}
              <div style={{ padding: "12px 20px", borderBottom: `1px solid ${DIM}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  border: `1px solid ${PURPLE}60`, background: `${PURPLE}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: PURPLE, fontWeight: 700,
                }}>{signalStep + 1}</div>
                <div>
                  <div style={{ fontSize: 12, color: PURPLE, fontWeight: 700, letterSpacing: 2 }}>{currentSignal.label}</div>
                  <div style={{ fontSize: 10, color: TEXT, letterSpacing: 1, marginTop: 2 }}>{currentSignal.desc}</div>
                </div>
              </div>
              {/* Signal dots */}
              <div style={{ padding: "20px 24px", display: "flex", gap: 20 }}>
                <div style={{ flex: 1, border: `1px solid ${BLUE}30`, borderRadius: 4, padding: "14px 18px", background: `${BLUE}06` }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: BLUE, fontWeight: 700, marginBottom: 12 }}>INITIATOR</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <SignalDot on={currentSignal.initiator.WRITABLE} color={BAZEL} label="WRITABLE" />
                    <SignalDot on={currentSignal.initiator.READABLE} color={BLUE} label="READABLE" />
                    <SignalDot on={currentSignal.initiator.ERROR} color={RUST} label="ERROR" />
                    <SignalDot on={currentSignal.initiator.USER} color={PURPLE} label="USER" />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${BLUE}, ${ORANGE})` }} />
                  <div style={{ fontSize: 8, letterSpacing: 2, color: "#334155" }}>CH</div>
                  <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${BLUE}, ${ORANGE})` }} />
                </div>
                <div style={{ flex: 1, border: `1px solid ${ORANGE}30`, borderRadius: 4, padding: "14px 18px", background: `${ORANGE}06` }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: ORANGE, fontWeight: 700, marginBottom: 12 }}>HANDLER</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <SignalDot on={currentSignal.handler.READABLE} color={BAZEL} label="READABLE" />
                    <SignalDot on={currentSignal.handler.WRITABLE} color={ORANGE} label="WRITABLE" />
                    <SignalDot on={currentSignal.handler.ERROR} color={RUST} label="ERROR" />
                    <SignalDot on={currentSignal.handler.USER} color={PURPLE} label="USER" />
                  </div>
                </div>
              </div>
              {/* Note */}
              <div style={{ padding: "10px 20px", borderTop: `1px solid ${DIM}`, background: "#050810" }}>
                <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
                  <span style={{ color: PURPLE, marginRight: 8 }}>&#9656;</span>{currentSignal.note}
                </div>
              </div>
            </div>
            {/* Key insight */}
            <div style={{ border: `1px solid ${BAZEL}30`, borderRadius: 4, padding: "12px 20px", background: `${BAZEL}08`, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: BAZEL, fontWeight: 700, minWidth: 90, paddingTop: 2 }}>KEY INSIGHT</div>
              <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
                Signals replace callbacks and condition variables. Handler waits with{" "}
                <span style={{ color: ORANGE }}>object_wait(READABLE)</span>, initiator blocks inside{" "}
                <span style={{ color: BLUE }}>channel_transact()</span> until READABLE is raised.
              </div>
            </div>
          </div>
        )}

        {/* ── CODE TAB ── */}
        {tab === "code" && (
          <div>
            <div style={{ display: "flex", gap: 0, marginBottom: 20, border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden" }}>
              {codeTabs.map((t, i) => (
                <button key={t.id} onClick={() => setCodeTab(i)} style={{
                  flex: 1, background: codeTab === i ? `${t.color}12` : "transparent",
                  border: "none", borderRight: i < codeTabs.length - 1 ? `1px solid ${DIM}` : "none",
                  borderBottom: codeTab === i ? `2px solid ${t.color}` : "2px solid transparent",
                  color: codeTab === i ? t.color : "#334155",
                  fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2,
                  padding: "10px 4px", cursor: "pointer", transition: "all 0.2s",
                }}>{t.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "0 4px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: currentCode.color, boxShadow: `0 0 8px ${currentCode.color}` }} />
              <div style={{ fontSize: 11, color: TEXT, letterSpacing: 1 }}>{currentCode.desc}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {currentCode.blocks.map((block) => (
                <div key={block.title} style={{ border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden", background: "#0D1320" }}>
                  <div style={{ padding: "10px 16px", borderBottom: `1px solid ${DIM}`, fontSize: 9, letterSpacing: 3, color: currentCode.color }}>{block.title}</div>
                  <CodeBlock code={block.code} accentColor={currentCode.color} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, border: `1px solid ${RUST}30`, borderRadius: 4, padding: "12px 20px", background: `${RUST}08` }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: RUST, fontWeight: 700, marginBottom: 4 }}>BAZEL CONNECTION</div>
              <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
                <span style={{ color: BAZEL }}>system.json5</span> → custom Bazel rule (<span style={{ color: PURPLE }}>target_codegen</span>) → generated Rust with handle constants.{" "}
                <span style={{ color: PURPLE }}>system_image</span> links kernel + apps into a single .elf.
              </div>
            </div>
          </div>
        )}

        {/* ── KERNEL TAB ── */}
        {tab === "kernel" && (
          <div>
            <div style={{ border: `1px solid ${DIM}`, borderRadius: 4, padding: "24px 28px", background: "#0D1320", marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14, textAlign: "center" }}>
                ChannelHandlerObject&lt;K: Kernel&gt;
              </div>
              <pre style={{ margin: 0, fontSize: 11, lineHeight: 1.8, color: TEXT, background: "#080C14", padding: "16px 20px", borderRadius: 4, border: `1px solid ${DIM}`, overflow: "auto" }}>
{`pub struct ChannelHandlerObject<K: Kernel> {
    base: ObjectBase<K>,
    active_transaction: Mutex<K, Option<Transaction<K>>>,
}

struct Transaction<K: Kernel> {
    send_buffer: SyscallBuffer,   // points into initiator's memory
    recv_buffer: SyscallBuffer,   // points into initiator's memory
    initiator: ForeignRc<..., ChannelInitiatorObject<K>>,
}`}
              </pre>
            </div>
            <div style={{ border: `1px solid ${DIM}`, borderRadius: 4, padding: "24px 28px", background: "#0D1320", marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14, textAlign: "center" }}>
                ChannelInitiatorObject&lt;K: Kernel&gt;
              </div>
              <pre style={{ margin: 0, fontSize: 11, lineHeight: 1.8, color: TEXT, background: "#080C14", padding: "16px 20px", borderRadius: 4, border: `1px solid ${DIM}`, overflow: "auto" }}>
{`pub struct ChannelInitiatorObject<K: Kernel> {
    base: ObjectBase<K>,
    handler: ForeignRc<..., ChannelHandlerObject<K>>,
}`}
              </pre>
            </div>
            {/* Key methods */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { fn: "channel_read(handle, offset, buf)", desc: "Non-blocking read from initiator's send_buffer — can call multiple times", color: ORANGE },
                { fn: "channel_respond(handle, buf)", desc: "Copy response to initiator's recv_buffer, clear handler signals, wake initiator", color: BAZEL },
                { fn: "channel_transact(handle, send, recv, deadline)", desc: "Lock → store Transaction → signal handler → block on READABLE|ERROR", color: BLUE },
              ].map((m) => (
                <div key={m.fn} style={{ padding: "12px 16px", border: `1px solid ${m.color}20`, borderRadius: 4, background: `${m.color}06` }}>
                  <div style={{ fontSize: 11, color: m.color, fontWeight: 700, marginBottom: 4 }}>{m.fn}</div>
                  <div style={{ fontSize: 10, color: TEXT }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CODEGEN TAB ── */}
        {tab === "codegen" && (
          <div>
            <div style={{ border: `1px solid ${DIM}`, borderRadius: 4, padding: "24px 28px", background: "#0D1320", marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14, textAlign: "center" }}>
                BUILD-TIME CODE GENERATION (JINJA TEMPLATES)
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ flex: 1, padding: "14px", border: `1px solid ${ORANGE}20`, borderRadius: 4, background: `${ORANGE}06` }}>
                  <div style={{ fontSize: 11, color: ORANGE, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>channel_handler.rs.jinja</div>
                  <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.7 }}>
                    Allocates <span style={{ color: ORANGE }}>ChannelHandlerObject</span> via static_foreign_rc!.
                    Produces concrete ForeignRc (for initiator linking) + upcasted dyn KernelObject.
                  </div>
                </div>
                <div style={{ flex: 1, padding: "14px", border: `1px solid ${BLUE}20`, borderRadius: 4, background: `${BLUE}06` }}>
                  <div style={{ fontSize: 11, color: BLUE, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>channel_initiator.rs.jinja</div>
                  <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.7 }}>
                    Links initiator to handler's ForeignRc via generated variable
                    <span style={{ color: PURPLE }}> object_&lt;app&gt;_&lt;name&gt;_handler</span>. Cross-process reference.
                  </div>
                </div>
              </div>
            </div>
            {/* Generated code */}
            <div style={{ border: `1px solid ${DIM}`, borderRadius: 4, padding: "24px 28px", background: "#0D1320" }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14, textAlign: "center" }}>GENERATED HANDLER ALLOCATION</div>
              <pre style={{ margin: 0, fontSize: 11, lineHeight: 1.8, color: TEXT, background: "#080C14", padding: "16px 20px", borderRadius: 4, border: `1px solid ${DIM}`, overflow: "auto" }}>
{`let handler = unsafe {
    static_foreign_rc!(AtomicUsize, ChannelHandlerObject<K>,
        ChannelHandlerObject::new(kernel))
};
// Upcast for object table, retain concrete for linking
(upcast_foreign_rc!(handler.clone() => dyn KernelObject<K>),
 handler)`}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
