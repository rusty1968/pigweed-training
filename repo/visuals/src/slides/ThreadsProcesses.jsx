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

const threadStates = [
  { label: "New", color: "#4A5568", desc: "Created but not initialized" },
  { label: "Initial", color: "#4A5568", desc: "Stack set up, not yet scheduled" },
  { label: "Ready", color: BAZEL, desc: "In the scheduler's run queue" },
  { label: "Running", color: BLUE, desc: "Currently executing on CPU" },
  { label: "Waiting", color: ORANGE, desc: "Blocked on object_wait() or channel" },
  { label: "Terminated", color: RUST, desc: "Entry point returned" },
  { label: "Joined", color: "#334155", desc: "Another thread collected the result" },
];

const tabs = [
  {
    id: "boot",
    label: "BOOT SEQUENCE",
    color: ORANGE,
  },
  {
    id: "hierarchy",
    label: "HIERARCHY",
    color: PURPLE,
  },
  {
    id: "lifecycle",
    label: "THREAD LIFECYCLE",
    color: BLUE,
  },
  {
    id: "config",
    label: "CONFIGURATION",
    color: BAZEL,
  },
];

export default function ThreadsProcesses() {
  const [tab, setTab] = useState(0);

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
          background: "linear-gradient(135deg, #38BDF8, #FF6B35)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 6,
        }}>THREADS & PROCESSES</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568" }}>
          EXECUTION MODEL AND MEMORY ISOLATION
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

        {/* BOOT SEQUENCE tab */}
        {tab === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              background: "#0D1320", overflow: "hidden",
            }}>
              <div style={{
                padding: "12px 20px", borderBottom: `1px solid ${DIM}`,
                fontSize: 9, letterSpacing: 3, color: ORANGE,
              }}>FROM POWER-ON TO APP THREADS</div>

              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    {
                      label: "main()",
                      color: RUST,
                      desc: "Bare metal entry. No scheduler yet. Inits hardware, console, interrupt controller.",
                      tag: "KERNEL-SPACE",
                    },
                    {
                      label: "Bootstrap Thread",
                      color: ORANGE,
                      desc: "First real thread. Created by main(), entered via half context switch. Runs kernel.init() with interrupts enabled.",
                      tag: "KERNEL-SPACE",
                    },
                    {
                      label: "Idle Thread",
                      color: "#4A5568",
                      desc: "Created by bootstrap thread. Lowest priority. Loops calling kernel.idle(). Keeps the run queue non-empty.",
                      tag: "KERNEL-SPACE",
                    },
                    {
                      label: "target::main()",
                      color: PURPLE,
                      desc: "Called by bootstrap thread after idle is started. Launches all app processes and their threads from system.json5.",
                      tag: "KERNEL-SPACE",
                    },
                    {
                      label: "App Threads",
                      color: BLUE,
                      desc: "Your \"main\" and \"worker\" threads. Run in userspace with MPU/PMP isolation. This is where your code lives.",
                      tag: "USER-SPACE",
                    },
                  ].map((step, i) => (
                    <div key={step.label}>
                      <div style={{
                        display: "flex", alignItems: "flex-start", gap: 14,
                        padding: "10px 0",
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          border: `1px solid ${step.color}60`,
                          background: `${step.color}15`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, color: step.color, fontWeight: 700,
                          flexShrink: 0,
                        }}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <div style={{
                              fontSize: 11, letterSpacing: 2, color: step.color,
                              fontWeight: 700,
                            }}>{step.label}</div>
                            <div style={{
                              fontSize: 8, letterSpacing: 2,
                              color: step.tag === "USER-SPACE" ? BLUE : RUST,
                              border: `1px solid ${step.tag === "USER-SPACE" ? BLUE : RUST}40`,
                              borderRadius: 2, padding: "1px 6px",
                              background: `${step.tag === "USER-SPACE" ? BLUE : RUST}10`,
                            }}>{step.tag}</div>
                          </div>
                          <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>{step.desc}</div>
                        </div>
                      </div>

                      {i < 4 && (
                        <div style={{ display: "flex", alignItems: "center", paddingLeft: 13 }}>
                          <div style={{
                            width: 1, height: 10,
                            background: `linear-gradient(180deg, ${step.color}60, transparent)`,
                          }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Thread taxonomy */}
            <div style={{
              marginTop: 14,
              border: `1px solid ${DIM}`, borderRadius: 4,
              overflow: "hidden",
            }}>
              <div style={{
                padding: "8px 16px", borderBottom: `1px solid ${DIM}`,
                fontSize: 9, letterSpacing: 3, color: ORANGE, background: "#0D1320",
              }}>THREAD TAXONOMY</div>
              <div style={{ padding: "12px 16px", background: "#050810" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { name: "Bootstrap", color: ORANGE, src: "Kernel (hardcoded)", role: "Inits kernel, starts idle + apps, becomes target::main()" },
                    { name: "Idle", color: "#4A5568", src: "Kernel (hardcoded)", role: "Lowest priority, keeps scheduler alive when all threads block" },
                    { name: "App threads", color: BLUE, src: "system.json5", role: "Your code — \"main\", \"worker\", etc. Run in userspace" },
                  ].map((t) => (
                    <div key={t.name} style={{
                      flex: 1, border: `1px solid ${t.color}30`, borderRadius: 3,
                      padding: "10px 12px", background: `${t.color}06`,
                    }}>
                      <div style={{ fontSize: 10, color: t.color, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: 9, color: "#4A5568", letterSpacing: 1, marginBottom: 4 }}>
                        Defined in: {t.src}
                      </div>
                      <div style={{ fontSize: 9, color: TEXT, lineHeight: 1.5 }}>{t.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HIERARCHY tab */}
        {tab === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Process box */}
            <div style={{
              border: `1px solid ${PURPLE}40`, borderRadius: "4px 4px 0 0",
              background: `${PURPLE}06`, overflow: "hidden",
            }}>
              <div style={{
                padding: "12px 20px", borderBottom: `1px solid ${DIM}`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: PURPLE, boxShadow: `0 0 8px ${PURPLE}` }} />
                <div style={{ fontSize: 12, letterSpacing: 3, color: PURPLE, fontWeight: 700 }}>PROCESS</div>
                <div style={{ width: 1, height: 14, background: DIM }} />
                <div style={{ fontSize: 10, color: TEXT }}>Isolation boundary — owns memory, threads, and object handles</div>
              </div>

              <div style={{ padding: "20px 24px" }}>
                {/* What a process contains */}
                <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                  {[
                    { label: "MemoryConfig", desc: "MPU/PMP regions", color: RUST },
                    { label: "ObjectTable", desc: "handle → KernelObject", color: YELLOW },
                    { label: "ThreadList", desc: "Owned threads", color: BLUE },
                  ].map((item) => (
                    <div key={item.label} style={{
                      flex: 1, border: `1px solid ${item.color}30`, borderRadius: 3,
                      padding: "10px 14px", background: `${item.color}08`,
                    }}>
                      <div style={{ fontSize: 10, color: item.color, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 10, color: TEXT }}>{item.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Threads inside */}
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 10 }}>
                  THREADS (owned by the process)
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {["main thread", "worker thread"].map((t, i) => (
                    <div key={t} style={{
                      border: `1px solid ${BLUE}30`, borderRadius: 3,
                      padding: "12px 16px", background: `${BLUE}06`, flex: 1,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE }} />
                        <div style={{ fontSize: 10, color: BLUE, fontWeight: 700, letterSpacing: 2 }}>
                          {t.toUpperCase()}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {[
                          { label: "stack", desc: `${i === 0 ? "2048" : "1024"} bytes (static)` },
                          { label: "state", desc: "Ready | Running | Waiting" },
                          { label: "arch_state", desc: "Saved registers (context switch)" },
                        ].map((f) => (
                          <div key={f.label} style={{ display: "flex", gap: 8, fontSize: 9 }}>
                            <span style={{ color: BLUE, minWidth: 60, letterSpacing: 1 }}>{f.label}</span>
                            <span style={{ color: "#4A5568" }}>{f.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key point */}
            <div style={{
              border: `1px solid ${BAZEL}30`, borderRadius: "0 0 4px 4px",
              padding: "12px 20px", background: `${BAZEL}08`,
              borderTop: "none",
            }}>
              <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
                <span style={{ color: BAZEL, fontWeight: 700 }}>No dynamic creation.</span>{" "}
                Every process, thread, stack, and object table is statically allocated at build time
                from <span style={{ color: BAZEL }}>system.json5</span>.
              </div>
            </div>
          </div>
        )}

        {/* LIFECYCLE tab */}
        {tab === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              background: "#0D1320", overflow: "hidden",
            }}>
              <div style={{
                padding: "12px 20px", borderBottom: `1px solid ${DIM}`,
                fontSize: 9, letterSpacing: 3, color: BLUE,
              }}>THREAD STATE MACHINE</div>

              <div style={{ padding: "20px 24px" }}>
                {/* State flow */}
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {threadStates.map((state, i) => (
                    <div key={state.label}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "8px 0",
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          border: `1px solid ${state.color}60`,
                          background: `${state.color}15`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, color: state.color, fontWeight: 700,
                          flexShrink: 0,
                        }}>{i}</div>
                        <div style={{
                          fontSize: 11, letterSpacing: 2, color: state.color,
                          fontWeight: 700, minWidth: 120,
                        }}>{state.label}</div>
                        <div style={{ fontSize: 10, color: TEXT, letterSpacing: 0.5 }}>{state.desc}</div>
                      </div>

                      {i < threadStates.length - 1 && (
                        <div style={{ display: "flex", alignItems: "center", paddingLeft: 13 }}>
                          <div style={{
                            width: 1, height: 12,
                            background: `linear-gradient(180deg, ${state.color}60, ${threadStates[i + 1].color}60)`,
                          }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Waiting branch note */}
                <div style={{
                  marginTop: 16, paddingTop: 14, borderTop: `1px solid ${DIM}`,
                  display: "flex", gap: 12,
                }}>
                  <div style={{
                    border: `1px solid ${ORANGE}30`, borderRadius: 3,
                    padding: "8px 12px", background: `${ORANGE}08`, flex: 1,
                  }}>
                    <div style={{ fontSize: 9, color: ORANGE, letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>
                      INTERRUPTIBLE
                    </div>
                    <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>
                      Returns Error::Cancelled if thread is terminated while waiting.
                    </div>
                  </div>
                  <div style={{
                    border: `1px solid ${RUST}30`, borderRadius: 3,
                    padding: "8px 12px", background: `${RUST}08`, flex: 1,
                  }}>
                    <div style={{ fontSize: 9, color: RUST, letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>
                      NON-INTERRUPTIBLE
                    </div>
                    <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>
                      Wait completes normally even if termination is pending.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONFIG tab */}
        {tab === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden",
            }}>
              <div style={{
                padding: "8px 16px", borderBottom: `1px solid ${DIM}`,
                fontSize: 9, letterSpacing: 3, color: BAZEL, background: "#0D1320",
              }}>system.json5 — PROCESS + THREADS + OBJECTS</div>
              <pre style={{
                margin: 0, padding: "14px 16px", background: "#050810",
                fontSize: 11, lineHeight: 1.8, overflowX: "auto",
              }}>
                {[
                  { text: "{", style: { color: TEXT } },
                  { text: "  apps: [", style: { color: TEXT } },
                  { text: "    {", style: { color: TEXT } },
                  { text: '      name: "my_app",', style: { color: BAZEL } },
                  { text: "      flash_size_bytes: 261120,", style: { color: TEXT } },
                  { text: "      ram_size_bytes: 65536,", style: { color: TEXT } },
                  { text: "", style: { color: TEXT } },
                  { text: "      // One process per app", style: { color: "#334155", fontStyle: "italic" } },
                  { text: "      process: {", style: { color: PURPLE } },
                  { text: "        objects: [", style: { color: YELLOW } },
                  { text: '          { name: "IPC", type: "channel_initiator",', style: { color: YELLOW } },
                  { text: '            handler_app: "server",', style: { color: ORANGE } },
                  { text: '            handler_object_name: "IPC" },', style: { color: ORANGE } },
                  { text: "        ],", style: { color: YELLOW } },
                  { text: "", style: { color: TEXT } },
                  { text: "        // Static threads — no runtime spawn", style: { color: "#334155", fontStyle: "italic" } },
                  { text: "        threads: [", style: { color: BLUE } },
                  { text: '          { name: "main",', style: { color: BLUE } },
                  { text: "            stack_size_bytes: 2048 },", style: { color: BLUE } },
                  { text: '          { name: "worker",', style: { color: BLUE } },
                  { text: "            stack_size_bytes: 1024 },", style: { color: BLUE } },
                  { text: "        ],", style: { color: BLUE } },
                  { text: "      },", style: { color: PURPLE } },
                  { text: "    },", style: { color: TEXT } },
                  { text: "  ],", style: { color: TEXT } },
                  { text: "}", style: { color: TEXT } },
                ].map((line, i) => (
                  <div key={i} style={line.style}>{line.text || "\u00A0"}</div>
                ))}
              </pre>
            </div>

            {/* What gets generated */}
            <div style={{
              border: `1px solid ${BAZEL}30`, borderRadius: 4,
              padding: "14px 20px", background: `${BAZEL}08`,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: BAZEL, fontWeight: 700, marginBottom: 8 }}>
                BAZEL GENERATES FROM THIS
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { label: "handle::IPC", desc: "u32 constant for syscalls" },
                  { label: "ObjectTable", desc: "Static array of kernel object refs" },
                  { label: "StackStorage", desc: "Static stack buffers per thread" },
                  { label: "MemoryConfig", desc: "MPU/PMP region definitions" },
                ].map((item) => (
                  <div key={item.label} style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: BAZEL, letterSpacing: 1, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 9, color: TEXT }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 28, fontSize: 9, letterSpacing: 3, color: "#1E2D45", textAlign: "center" }}>
        CLICK TABS TO EXPLORE · pw_kernel THREADS & PROCESSES
      </div>
    </div>
  );
}
