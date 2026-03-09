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

const sections = [
  {
    id: "concept",
    label: "THE PROBLEM",
    color: ORANGE,
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.8, letterSpacing: 0.3 }}>
          A handler process may serve multiple channels. Polling each one wastes CPU.
          Blocking on one misses the others. You need a way to say:
        </div>
        <div style={{
          padding: "12px 20px", border: `1px solid ${ORANGE}40`,
          borderRadius: 4, background: `${ORANGE}08`,
          fontSize: 12, color: ORANGE, fontStyle: "italic", textAlign: "center",
          letterSpacing: 1,
        }}>
          "Wake me when ANY of these channels have data."
        </div>
        <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.8, letterSpacing: 0.3 }}>
          This is what <span style={{ color: PURPLE, fontWeight: 700 }}>WaitGroup</span> solves —
          pw_kernel's equivalent of Linux's <span style={{ color: "#4A5568" }}>epoll</span> or
          BSD's <span style={{ color: "#4A5568" }}>kqueue</span>.
        </div>
      </div>
    ),
  },
  {
    id: "design",
    label: "DESIGN",
    color: PURPLE,
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          {
            title: "ALLOCATE AT ADD-TIME",
            desc: "All memory is reserved when you call wait_group_add(), not during wait. No allocation on the hot path.",
            color: BAZEL,
          },
          {
            title: "SIGNAL-DRIVEN",
            desc: "Each added object is monitored for a signal mask (e.g. READABLE). When any match fires, the wait group itself becomes READABLE.",
            color: BLUE,
          },
          {
            title: "USER_DATA TAGGING",
            desc: "Each entry gets a user_data value at add-time. When the wait returns, user_data tells you which object fired — no scanning needed.",
            color: YELLOW,
          },
          {
            title: "STATIC CONFIGURATION",
            desc: "Wait groups are declared in system.json5, generated at build time. No runtime creation.",
            color: PURPLE,
          },
        ].map((item) => (
          <div key={item.title} style={{
            display: "flex", gap: 14, alignItems: "flex-start",
            padding: "10px 16px", border: `1px solid ${DIM}`,
            borderRadius: 3, background: "#050810",
          }}>
            <div style={{
              fontSize: 10, letterSpacing: 2, color: item.color,
              fontWeight: 700, minWidth: 180, paddingTop: 2,
            }}>{item.title}</div>
            <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "diagram",
    label: "FLOW",
    color: BLUE,
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Visual: channels feeding into wait group */}
        <div style={{
          border: `1px solid ${DIM}`, borderRadius: 4,
          padding: "24px 28px", background: "#050810",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            {/* Channel columns */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { name: "IPC_1", tag: "user_data: 1", color: BLUE },
                { name: "IPC_2", tag: "user_data: 2", color: ORANGE },
                { name: "IPC_3", tag: "user_data: 3", color: BAZEL },
              ].map((ch) => (
                <div key={ch.name} style={{
                  border: `1px solid ${ch.color}40`, borderRadius: 3,
                  padding: "8px 14px", background: `${ch.color}08`,
                  display: "flex", alignItems: "center", gap: 10, minWidth: 180,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: ch.color, boxShadow: `0 0 6px ${ch.color}` }} />
                  <div style={{ fontSize: 10, color: ch.color, letterSpacing: 2, fontWeight: 700 }}>{ch.name}</div>
                  <div style={{ fontSize: 9, color: "#4A5568", letterSpacing: 1 }}>{ch.tag}</div>
                </div>
              ))}
            </div>

            {/* Arrows */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#334155" }}>add()</div>
              {[BLUE, ORANGE, BAZEL].map((c, i) => (
                <div key={i} style={{
                  width: 40, height: 1,
                  background: `linear-gradient(90deg, ${c}80, ${PURPLE})`,
                  margin: "6px 0",
                }} />
              ))}
            </div>

            {/* Wait Group */}
            <div style={{
              border: `1px solid ${PURPLE}60`, borderRadius: 4,
              padding: "16px 20px", background: `${PURPLE}10`,
              boxShadow: `0 0 20px ${PURPLE}15`,
              textAlign: "center", minWidth: 140,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: PURPLE, fontWeight: 700, marginBottom: 6 }}>
                WAIT_GROUP
              </div>
              <div style={{ fontSize: 9, color: TEXT, letterSpacing: 1 }}>
                object_wait()<br />
                Signals::READABLE
              </div>
            </div>

            {/* Arrow to thread */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#334155" }}>wakes</div>
              <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${PURPLE}, ${YELLOW})` }} />
              <div style={{ fontSize: 10, color: YELLOW }}>{"\u25B6"}</div>
            </div>

            {/* Thread */}
            <div style={{
              border: `1px solid ${YELLOW}40`, borderRadius: 4,
              padding: "16px 20px", background: `${YELLOW}08`,
              textAlign: "center", minWidth: 120,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: YELLOW, fontWeight: 700, marginBottom: 6 }}>
                THREAD
              </div>
              <div style={{ fontSize: 9, color: TEXT, letterSpacing: 1 }}>
                reads user_data<br />
                dispatches
              </div>
            </div>
          </div>
        </div>

        {/* Step explanation */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 24,
          marginTop: 16,
        }}>
          {[
            { n: "1", text: "Add channels with signal masks + user_data", color: PURPLE },
            { n: "2", text: "Wait on the group (single syscall)", color: BLUE },
            { n: "3", text: "user_data identifies which channel fired", color: YELLOW },
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
    ),
  },
  {
    id: "code",
    label: "CODE",
    color: BAZEL,
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Config */}
        <div style={{
          border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden",
        }}>
          <div style={{
            padding: "8px 16px", borderBottom: `1px solid ${DIM}`,
            fontSize: 9, letterSpacing: 3, color: BAZEL, background: "#0D1320",
          }}>system.json5</div>
          <pre style={{
            margin: 0, padding: "12px 16px", background: "#050810",
            fontSize: 11, lineHeight: 1.8, color: TEXT, overflowX: "auto",
          }}>{`objects: [
  { name: "IPC_1", type: "channel_initiator", ... },
  { name: "IPC_2", type: "channel_initiator", ... },
  { name: "WAIT_GROUP", type: "wait_group" },
]`}</pre>
        </div>

        {/* Usage */}
        <div style={{
          border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden",
        }}>
          <div style={{
            padding: "8px 16px", borderBottom: `1px solid ${DIM}`,
            fontSize: 9, letterSpacing: 3, color: PURPLE, background: "#0D1320",
          }}>RUST USAGE</div>
          <pre style={{
            margin: 0, padding: "12px 16px", background: "#050810",
            fontSize: 11, lineHeight: 1.8, overflowX: "auto",
          }}>
            {[
              { text: "// Register channels with the wait group", style: { color: "#334155", fontStyle: "italic" } },
              { text: "syscall::wait_group_add(", style: { color: BLUE } },
              { text: "    handle::WAIT_GROUP,", style: { color: PURPLE } },
              { text: "    handle::IPC_1,       // channel to monitor", style: { color: TEXT } },
              { text: "    Signals::WRITABLE,   // signal to watch for", style: { color: ORANGE } },
              { text: "    1,                   // user_data tag", style: { color: YELLOW } },
              { text: ")?;", style: { color: TEXT } },
              { text: "", style: { color: TEXT } },
              { text: "// Block until any registered channel signals", style: { color: "#334155", fontStyle: "italic" } },
              { text: "let result = syscall::object_wait(", style: { color: BLUE } },
              { text: "    handle::WAIT_GROUP,", style: { color: PURPLE } },
              { text: "    Signals::READABLE,   // group is readable when any child fires", style: { color: ORANGE } },
              { text: "    Instant::MAX,", style: { color: TEXT } },
              { text: ")?;", style: { color: TEXT } },
              { text: "", style: { color: TEXT } },
              { text: "// Dispatch based on which channel fired", style: { color: "#334155", fontStyle: "italic" } },
              { text: "match result.user_data {", style: { color: RUST } },
              { text: "    1 => handle_ipc_1(),", style: { color: YELLOW } },
              { text: "    2 => handle_ipc_2(),", style: { color: YELLOW } },
              { text: "    _ => unreachable!(),", style: { color: "#334155" } },
              { text: "}", style: { color: RUST } },
            ].map((line, i) => (
              <div key={i} style={line.style}>{line.text || "\u00A0"}</div>
            ))}
          </pre>
        </div>
      </div>
    ),
  },
];

export default function WaitGroups() {
  const [tab, setTab] = useState(0);
  const current = sections[tab];

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
          background: "linear-gradient(135deg, #A78BFA, #FBBF24)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 6,
        }}>WAIT GROUPS</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568" }}>
          MULTIPLEXED WAITING — pw_kernel's EPOLL
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 780 }}>
        {/* Tab bar */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 24,
          border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden",
        }}>
          {sections.map((s, i) => (
            <button key={s.id} onClick={() => setTab(i)} style={{
              flex: 1, background: tab === i ? `${s.color}12` : "transparent",
              border: "none",
              borderRight: i < sections.length - 1 ? `1px solid ${DIM}` : "none",
              borderBottom: tab === i ? `2px solid ${s.color}` : "2px solid transparent",
              color: tab === i ? s.color : "#334155",
              fontFamily: "'Courier New', monospace",
              fontSize: 9, letterSpacing: 2, padding: "10px 4px",
              cursor: "pointer", transition: "all 0.2s",
            }}>{s.label}</button>
          ))}
        </div>

        {/* Content */}
        {current.content}
      </div>

      <div style={{ marginTop: 28, fontSize: 9, letterSpacing: 3, color: "#1E2D45", textAlign: "center" }}>
        CLICK TABS TO EXPLORE · pw_kernel WAIT GROUPS
      </div>
    </div>
  );
}
