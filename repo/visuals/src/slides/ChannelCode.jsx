import { useState } from "react";

const BAZEL = "#00FFB2";
const RUST = "#CE422B";
const PURPLE = "#A78BFA";
const BLUE = "#38BDF8";
const ORANGE = "#FF6B35";
const DIM = "#1A2235";
const TEXT = "#94A3B8";
const BG = "#080C14";

const tabs = [
  {
    id: "config",
    label: "system.json5",
    color: BAZEL,
    desc: "Static channel wiring — defined at build time",
    blocks: [
      {
        title: "INITIATOR APP",
        code: `{
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
}`,
      },
      {
        title: "HANDLER APP",
        code: `{
  name: "handler",
  process: {
    objects: [
      { name: "IPC", type: "channel_handler" },
    ],
    threads: [
      { name: "main", stack_size_bytes: 2048 },
    ],
  },
}`,
      },
    ],
  },
  {
    id: "initiator",
    label: "INITIATOR",
    color: BLUE,
    desc: "Sends data and blocks until response arrives",
    blocks: [
      {
        title: "SYNC TRANSACTION",
        code: `// Send request, block until handler responds
let bytes_received = syscall::channel_transact(
    handle::IPC,        // channel handle (generated)
    &send_buf,          // data to send
    &mut recv_buf,      // buffer for response
    Instant::MAX,       // deadline (no timeout)
)?;

// recv_buf[..bytes_received] contains the response`,
      },
      {
        title: "ASYNC TRANSACTION",
        code: `// Start transaction without blocking
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
)?;`,
      },
    ],
  },
  {
    id: "handler",
    label: "HANDLER",
    color: ORANGE,
    desc: "Waits for requests, reads data, sends response",
    blocks: [
      {
        title: "RECEIVE AND RESPOND",
        code: `loop {
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
}`,
      },
    ],
  },
  {
    id: "waitgroup",
    label: "WAIT GROUP",
    color: PURPLE,
    desc: "Wait on multiple channels simultaneously (like epoll)",
    blocks: [
      {
        title: "MULTI-CHANNEL COORDINATION",
        code: `// Add channels to the wait group
syscall::wait_group_add(
    handle::WAIT_GROUP,
    handle::IPC_1,
    Signals::WRITABLE,  // wake when ready
    1,                   // user_data identifier
)?;

syscall::wait_group_add(
    handle::WAIT_GROUP,
    handle::IPC_2,
    Signals::WRITABLE,
    2,
)?;

// Wait for any channel to become ready
let result = syscall::object_wait(
    handle::WAIT_GROUP,
    Signals::READABLE,
    Instant::MAX,
)?;

// result.user_data tells us which channel fired`,
      },
    ],
  },
];

function CodeBlock({ code }) {
  return (
    <pre style={{
      margin: 0, padding: "14px 16px",
      background: "#050810", border: `1px solid ${DIM}`,
      borderRadius: 3, fontSize: 11, lineHeight: 1.8,
      overflowX: "auto",
    }}>
      {code.split("\n").map((line, i) => {
        const isComment = line.trim().startsWith("//");
        const isKeyword = /^\s*(let|loop|unsafe|await)\b/.test(line);
        const isSyscall = /syscall::/.test(line);
        const isHandle = /handle::/.test(line);
        const isSignal = /Signals::/.test(line);
        const isType = /Instant::/.test(line);
        return (
          <div key={i} style={{
            color: isComment ? "#334155"
              : isSyscall ? BLUE
              : isHandle ? PURPLE
              : isSignal ? ORANGE
              : isType ? TEXT
              : isKeyword ? RUST
              : TEXT,
            fontStyle: isComment ? "italic" : "normal",
          }}>{line || "\u00A0"}</div>
        );
      })}
    </pre>
  );
}

export default function ChannelCode() {
  const [tab, setTab] = useState(0);
  const current = tabs[tab];

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
          background: "linear-gradient(135deg, #38BDF8, #FF6B35)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 6,
        }}>CHANNELS IN CODE</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568" }}>
          CONFIG, SYSCALLS, AND WAIT GROUPS
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 780 }}>
        {/* Tab bar */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 24,
          border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden",
        }}>
          {tabs.map((t, i) => (
            <button key={t.id} onClick={() => setTab(i)} style={{
              flex: 1, background: tab === i ? `${t.color}12` : "transparent",
              border: "none",
              borderRight: i < tabs.length - 1 ? `1px solid ${DIM}` : "none",
              borderBottom: tab === i ? `2px solid ${t.color}` : "2px solid transparent",
              color: tab === i ? t.color : "#334155",
              fontFamily: "'Courier New', monospace",
              fontSize: 9, letterSpacing: 2, padding: "10px 4px",
              cursor: "pointer", transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Description */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 16, padding: "0 4px",
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: current.color, boxShadow: `0 0 8px ${current.color}`,
          }} />
          <div style={{ fontSize: 11, color: TEXT, letterSpacing: 1 }}>{current.desc}</div>
        </div>

        {/* Code blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {current.blocks.map((block) => (
            <div key={block.title} style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              overflow: "hidden", background: "#0D1320",
            }}>
              <div style={{
                padding: "10px 16px",
                borderBottom: `1px solid ${DIM}`,
                fontSize: 9, letterSpacing: 3, color: current.color,
              }}>{block.title}</div>
              <div style={{ padding: "0" }}>
                <CodeBlock code={block.code} />
              </div>
            </div>
          ))}
        </div>

        {/* Build connection callout */}
        <div style={{
          marginTop: 20,
          border: `1px solid ${RUST}30`, borderRadius: 4,
          padding: "14px 20px", background: `${RUST}08`,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: RUST, fontWeight: 700, marginBottom: 6 }}>
            BAZEL CONNECTION
          </div>
          <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
            The <span style={{ color: BAZEL }}>system.json5</span> config is consumed by
            a custom Bazel rule (<span style={{ color: PURPLE }}>target_codegen</span>) that generates
            Rust source with handle constants and object initialization.
            The <span style={{ color: PURPLE }}>system_image</span> rule then links kernel + apps
            into a single .elf — all driven by <span style={{ color: BAZEL }}>select()</span> and
            <span style={{ color: BLUE }}>transitions</span>.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28, fontSize: 9, letterSpacing: 3, color: "#1E2D45", textAlign: "center" }}>
        CLICK TABS TO EXPLORE · pw_kernel CHANNELS
      </div>
    </div>
  );
}
