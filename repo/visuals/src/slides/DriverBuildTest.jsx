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
        const isKey = /^\s*(name|type|flash_|ram_|stack_|process|objects|threads|apps|kernel|arch|handler_)/.test(line);
        const isString = /"[^"]*"/.test(line);
        const isKeyword = /^\s*(pub|fn|let|struct|impl|match|if|test_)\b/.test(line);
        return (
          <div key={i} style={{
            color: isComment ? "#334155" : isKey ? ORANGE : isString ? BAZEL
              : isKeyword ? RUST : TEXT,
            fontStyle: isComment ? "italic" : "normal",
          }}>{line || "\u00A0"}</div>
        );
      })}
    </pre>
  );
}

export default function DriverBuildTest() {
  const [tab, setTab] = useState("config");

  const tabs = [
    { id: "config", label: "SYSTEM CONFIG" },
    { id: "bazel", label: "BUILD GRAPH" },
    { id: "testing", label: "TESTING" },
    { id: "exercises", label: "EXERCISES" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 10 }}>
          MODULES 7 – 10
        </div>
        <div style={{
          fontSize: 34, fontWeight: 900, letterSpacing: 6,
          background: "linear-gradient(135deg, #00FFB2, #38BDF8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>BUILD &amp; TEST</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568", maxWidth: 560, lineHeight: 1.7 }}>
          System wiring, <span style={{ color: BAZEL }}>Bazel build graph</span>, integration tests, and exercises
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? `${BAZEL}18` : "none",
            border: `1px solid ${tab === t.id ? BAZEL + "60" : DIM}`,
            color: tab === t.id ? BAZEL : "#4A5568",
            fontSize: 10, letterSpacing: 3, fontWeight: 700,
            padding: "8px 18px", borderRadius: 3, cursor: "pointer",
            fontFamily: "'Courier New', monospace", transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 820 }}>

        {/* ── SYSTEM CONFIG TAB ── */}
        {tab === "config" && (
          <div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                system.json5 — PROCESS / CHANNEL / MEMORY LAYOUT
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: ORANGE, marginBottom: 8 }}>SERVER PROCESS</div>
                  <CodeBlock code={`{
  name: "i2c_server",
  flash_size_bytes: 131072,  // 128 KB
  ram_size_bytes: 65536,     // 64 KB
  process: {
    objects: [{
      name: "I2C",
      type: "channel_handler",
    }],
    threads: [{
      name: "i2c server thread",
      stack_size_bytes: 4096,
    }],
  },
}`} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: BLUE, marginBottom: 8 }}>CLIENT PROCESS</div>
                  <CodeBlock code={`{
  name: "i2c_client",
  flash_size_bytes: 131072,
  ram_size_bytes: 65536,
  process: {
    objects: [{
      name: "I2C",
      type: "channel_initiator",
      handler_app: "i2c_server",
      handler_object_name: "I2C",
    }],
    threads: [{
      name: "i2c client thread",
      stack_size_bytes: 2048,
    }],
  },
}`} />
                </div>
              </div>
            </div>
            {/* What the kernel does */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "18px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                WHAT THE KERNEL CREATES FROM THIS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "MPU REGIONS", desc: "Per-app flash + RAM isolation — no cross-touch", color: PURPLE },
                  { label: "CHANNEL OBJECTS", desc: "Wired via handler_app + handler_object_name match", color: ORANGE },
                  { label: "HANDLE CONSTANTS", desc: "target_codegen → app_i2c_server::handle::I2C", color: BAZEL },
                  { label: "THREADS", desc: "Each process gets declared stack; blocks on first wait", color: BLUE },
                ].map((item) => (
                  <div key={item.label} style={{
                    padding: "10px 14px", border: `1px solid ${item.color}20`,
                    borderRadius: 4, background: `${item.color}06`,
                  }}>
                    <div style={{ fontSize: 10, color: item.color, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Sizing */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "14px 20px", background: "#0D1320",
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 8 }}>SIZING GUIDELINES</div>
              <div style={{ display: "flex", gap: 14, fontSize: 10 }}>
                {[
                  { res: "Flash", rule: "Compile, round up to power of 2", color: RUST },
                  { res: "RAM", rule: "MMIO + stack + DMA descriptors", color: ORANGE },
                  { res: "Stack", rule: "Profile with overflow detection; 4KB conservative", color: PURPLE },
                ].map((s) => (
                  <div key={s.res} style={{ flex: 1 }}>
                    <span style={{ color: s.color, fontWeight: 700 }}>{s.res}: </span>
                    <span style={{ color: TEXT }}>{s.rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BUILD GRAPH TAB ── */}
        {tab === "bazel" && (
          <div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                DEPENDENCY TREE — system_image combines everything
              </div>
              <pre style={{
                margin: 0, fontSize: 11, lineHeight: 1.9, color: TEXT,
                background: "#050810", padding: "16px 20px", borderRadius: 4,
                border: `1px solid ${DIM}`, overflow: "auto",
              }}>
{`:i2c                              `}<span style={{ color: BAZEL }}>(system_image)</span>{`
├── :target                       `}<span style={{ color: RUST }}>(rust_binary — kernel)</span>{`
│   ├── :codegen                  `}<span style={{ color: PURPLE }}>(target_codegen)</span>{`
│   ├── :linker_script            `}<span style={{ color: PURPLE }}>(target_linker_script)</span>{`
│   └── @pigweed//pw_kernel/...
├── //services/i2c/server         `}<span style={{ color: ORANGE }}>(rust_binary — app)</span>{`
│   ├── :app_i2c_server           `}<span style={{ color: PURPLE }}>(app_package)</span>{`
│   ├── //services/i2c/api
│   └── //services/i2c/backend-aspeed
└── :i2c_client_test              `}<span style={{ color: BLUE }}>(rust_binary — app)</span>{`
    ├── :app_i2c_client           `}<span style={{ color: PURPLE }}>(app_package)</span>{`
    └── //services/i2c/client`}
              </pre>
            </div>
            {/* Key rules */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                KEY BAZEL RULES
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { rule: "system_image", desc: "Combines kernel + apps into one ELF", color: BAZEL,
                    code: `system_image(name = "i2c", apps = [...], kernel = ":target")` },
                  { rule: "app_package", desc: "Generates handle module from system.json5", color: PURPLE,
                    code: `app_package(name = "app_i2c_server", app_name = "i2c_server")` },
                  { rule: "system_image_test", desc: "Runs image on target, checks exit code", color: BLUE,
                    code: `system_image_test(name = "i2c_test", image = ":i2c")` },
                ].map((r) => (
                  <div key={r.rule} style={{
                    border: `1px solid ${r.color}20`, borderRadius: 4,
                    padding: "10px 16px", background: `${r.color}06`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: r.color, fontWeight: 700 }}>{r.rule}</span>
                      <span style={{ fontSize: 9, color: TEXT }}>— {r.desc}</span>
                    </div>
                    <div style={{
                      fontSize: 10, color: TEXT, padding: "6px 10px",
                      background: "#050810", borderRadius: 3, border: `1px solid ${DIM}`,
                    }}>{r.code}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Build commands */}
            <div style={{
              border: `1px solid ${BAZEL}30`, borderRadius: 4,
              padding: "14px 20px", background: `${BAZEL}08`,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: BAZEL, fontWeight: 700, marginBottom: 8 }}>BUILD COMMANDS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 10 }}>
                {[
                  { cmd: "bazel build --config=k_ast1060_evb //target/.../i2c:i2c", desc: "Full system image" },
                  { cmd: "bazel test --config=k_ast1060_evb ...i2c:i2c_test", desc: "Run on EVB" },
                  { cmd: "bazel test :i2c_uart_test --test_env=UART_DEVICE=...", desc: "Physical board" },
                ].map((c) => (
                  <div key={c.cmd} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: BAZEL }}>$</span>
                    <span style={{ color: TEXT, flex: 1 }}>{c.cmd}</span>
                    <span style={{ color: "#334155", fontSize: 9 }}>{c.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TESTING TAB ── */}
        {tab === "testing" && (
          <div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "20px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>
                INTEGRATION TEST — full IPC stack end-to-end
              </div>
              <CodeBlock code={`fn run_i2c_tests() -> Result<()> {
    let mut client = IpcI2cClient::new(handle::I2C);
    let mut results = TestResults::new();

    test_probe_adt7490(&mut client, &mut results);
    test_register_reads(&mut client, &mut results);
    test_write_read_device_id(&mut client, &mut results);
    test_probe_vacant(&mut client, &mut results);

    if results.failed > 0 { Err(Error::Unknown) } else { Ok(()) }
}`} />
            </div>
            {/* Test patterns table */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "18px 24px", background: "#0D1320", marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>TEST PATTERNS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { test: "test_probe_adt7490", exercises: "Zero-length write → ACK", expected: "Ok(true)", color: BAZEL },
                  { test: "test_register_reads", exercises: "Separate write + read", expected: "Known POR defaults", color: BLUE },
                  { test: "test_write_read_device_id", exercises: "Combined write_read", expected: "Device ID byte", color: PURPLE },
                  { test: "test_probe_vacant", exercises: "Zero-length write → NAK", expected: "Ok(false)", color: ORANGE },
                ].map((t) => (
                  <div key={t.test} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
                    border: `1px solid ${DIM}`, borderRadius: 3,
                  }}>
                    <div style={{ fontSize: 10, color: t.color, fontWeight: 700, minWidth: 190 }}>{t.test}</div>
                    <div style={{ fontSize: 10, color: TEXT, flex: 1 }}>{t.exercises}</div>
                    <div style={{
                      fontSize: 9, padding: "3px 10px", borderRadius: 3,
                      background: `${t.color}15`, color: t.color,
                      border: `1px solid ${t.color}30`,
                    }}>{t.expected}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "14px 20px", background: "#0D1320",
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 8 }}>REPORTING</div>
              <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.7 }}>
                Tests log via <span style={{ color: PURPLE }}>pw_log</span> and call{" "}
                <span style={{ color: BLUE }}>syscall::debug_shutdown(Ok(()))</span> or{" "}
                <span style={{ color: RUST }}>Err(e)</span> for pass/fail.
                The <span style={{ color: BAZEL }}>system_image_test</span> rule interprets the exit code.
              </div>
            </div>
          </div>
        )}

        {/* ── EXERCISES TAB ── */}
        {tab === "exercises" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  n: "1", title: "Add ConfigureSpeed", color: ORANGE,
                  desc: "Let clients change the I2C clock frequency at runtime",
                  steps: [
                    "Add encoding to wire.rs (opcode 5 + u32 Hz payload)",
                    "Add backend.configure_speed(bus, hz) method",
                    "Add dispatch branch in server",
                    "Add client method + test",
                  ],
                },
                {
                  n: "2", title: "Port to a New SoC", color: RUST,
                  desc: "Create backend-stm32/ for an STM32 chip",
                  steps: [
                    "Create Stm32I2cBackend wrapping STM32 HAL",
                    "Implement write, read, write_read, recover_bus",
                    "Map HAL errors to ResponseCode",
                    "Change server/BUILD.bazel deps — everything else stays",
                  ],
                },
                {
                  n: "3", title: "Add Target Mode (I2C Slave)", color: PURPLE,
                  desc: "Respond to incoming I2C transactions from external master",
                  steps: [
                    "Study api/src/target.rs — I2cTargetClient exists",
                    "Add EnableTarget, DisableTarget, WaitForMessages opcodes",
                    "Multiplex master IPC + slave events — design challenge",
                  ],
                },
                {
                  n: "4", title: "Add a Second Client", color: BLUE,
                  desc: "Two client processes sharing one I2C server",
                  steps: [
                    "Add third app in system.json5 with channel_initiator",
                    "Add second channel_handler in server",
                    "Reason about bus concurrency with simultaneous requests",
                  ],
                },
              ].map((ex) => (
                <div key={ex.n} style={{
                  border: `1px solid ${DIM}`, borderRadius: 4,
                  padding: "16px 20px", background: "#0D1320", position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: 2,
                    background: `linear-gradient(90deg, transparent, ${ex.color}60, transparent)`,
                  }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      border: `1px solid ${ex.color}60`, background: `${ex.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: ex.color, fontWeight: 700,
                    }}>{ex.n}</div>
                    <div>
                      <div style={{ fontSize: 12, color: ex.color, fontWeight: 700, letterSpacing: 2 }}>{ex.title}</div>
                      <div style={{ fontSize: 10, color: TEXT }}>{ex.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 36 }}>
                    {ex.steps.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: `${ex.color}60` }} />
                        <span style={{ color: TEXT }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Eight artifacts */}
            <div style={{
              marginTop: 14, border: `1px solid ${BAZEL}30`, borderRadius: 4,
              padding: "14px 20px", background: `${BAZEL}08`,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: BAZEL, fontWeight: 700, marginBottom: 6 }}>THE 8 ARTIFACTS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  "wire.rs", "api/*.rs", "backend/lib.rs", "server/main.rs",
                  "client/lib.rs", "system.json5", "BUILD.bazel ×5+", "tests/",
                ].map((a) => (
                  <div key={a} style={{
                    fontSize: 10, padding: "4px 10px", borderRadius: 3,
                    background: `${BAZEL}12`, color: BAZEL, border: `1px solid ${BAZEL}30`,
                  }}>{a}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
