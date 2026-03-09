import { useState } from "react";

const RUST = "#CE422B";
const PURPLE = "#A78BFA";
const BLUE = "#38BDF8";
const ORANGE = "#FF6B35";
const BAZEL = "#00FFB2";
const YELLOW = "#FBBF24";
const DIM = "#1A2235";
const TEXT = "#94A3B8";
const BG = "#080C14";

const flowSteps = [
  { label: "HW IRQ fires", color: RUST, detail: "Hardware interrupt triggers" },
  { label: "ISR wrapper", color: ORANGE, detail: "Generated code masks IRQ, signals object" },
  { label: "Signal wakes thread", color: PURPLE, detail: "Thread blocked in object_wait() resumes" },
  { label: "Userspace services", color: BLUE, detail: "App reads device, processes data" },
  { label: "interrupt_ack()", color: BAZEL, detail: "Clears signal bits, unmasks HW IRQ" },
];

const isrSteps = [
  { fn: "interrupt_handler_enter(irq)", desc: "Mask IRQ at controller", color: RUST },
  { fn: "object.interrupt(signal)", desc: "Set signal bits on InterruptObject", color: ORANGE },
  { fn: "interrupt_handler_exit(irq)", desc: "Reschedule if higher-priority thread woke", color: PURPLE },
];

const controllerMethods = [
  { method: "enable_interrupt(irq)", purpose: "Enable a specific IRQ" },
  { method: "disable_interrupt(irq)", purpose: "Disable a specific IRQ" },
  { method: "userspace_interrupt_handler_enter", purpose: "Mask IRQ before signaling (ISR)" },
  { method: "userspace_interrupt_handler_exit", purpose: "Complete ISR, reschedule if needed" },
  { method: "userspace_interrupt_ack", purpose: "Unmask IRQ after userspace ack" },
];

export default function InterruptObjects() {
  const [tab, setTab] = useState("flow");

  const tabs = [
    { id: "flow", label: "IRQ FLOW" },
    { id: "struct", label: "STRUCTURE" },
    { id: "codegen", label: "CODE GEN" },
    { id: "usage", label: "USAGE" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 10 }}>
          pw_kernel OBJECTS
        </div>
        <div style={{
          fontSize: 34, fontWeight: 900, letterSpacing: 6,
          background: "linear-gradient(135deg, #CE422B, #FF6B35)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>INTERRUPT OBJECTS</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568", maxWidth: 560, lineHeight: 1.7 }}>
          Deliver hardware IRQs to userspace. Up to <span style={{ color: RUST }}>15 IRQ sources</span> per
          object, mapped to signal bits 16–30.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: tab === t.id ? `${RUST}18` : "none",
              border: `1px solid ${tab === t.id ? RUST + "60" : DIM}`,
              color: tab === t.id ? RUST : "#4A5568",
              fontSize: 10, letterSpacing: 3, fontWeight: 700,
              padding: "8px 18px", borderRadius: 3,
              cursor: "pointer", fontFamily: "'Courier New', monospace",
              transition: "all 0.2s",
            }}
          >{t.label}</button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 820 }}>

        {/* ── IRQ FLOW TAB ── */}
        {tab === "flow" && (
          <div>
            {/* End-to-end flow */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320", marginBottom: 16,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 20, textAlign: "center" }}>
                END-TO-END INTERRUPT LIFECYCLE
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
                {flowSteps.map((s, i) => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      border: `1px solid ${s.color}40`, borderRadius: 4,
                      padding: "12px 14px", background: `${s.color}08`,
                      textAlign: "center", minWidth: 120,
                    }}>
                      <div style={{ fontSize: 10, color: s.color, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 9, color: TEXT, lineHeight: 1.5 }}>{s.detail}</div>
                    </div>
                    {i < flowSteps.length - 1 && (
                      <div style={{ color: "#334155", fontSize: 16, padding: "0 4px" }}>→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ISR detail */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320", marginBottom: 16,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 16, textAlign: "center" }}>
                INSIDE THE GENERATED ISR WRAPPER
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {isrSteps.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      border: `1px solid ${s.color}60`, background: `${s.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: s.color, fontWeight: 700, flexShrink: 0,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 11, color: s.color, fontWeight: 700 }}>{s.fn}</span>
                      <span style={{ fontSize: 10, color: TEXT, marginLeft: 10 }}>— {s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key insight */}
            <div style={{
              border: `1px solid ${RUST}30`, borderRadius: 4,
              padding: "14px 24px", background: `${RUST}08`, textAlign: "center",
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: RUST, fontWeight: 700, marginBottom: 4 }}>
                KEY SAFETY PROPERTY
              </div>
              <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.7 }}>
                The IRQ stays <span style={{ color: RUST, fontWeight: 700 }}>masked at hardware</span> between ISR
                and <span style={{ color: BAZEL }}>interrupt_ack()</span>. No interrupt storms — userspace processes at its own pace.
              </div>
            </div>
          </div>
        )}

        {/* ── STRUCTURE TAB ── */}
        {tab === "struct" && (
          <div>
            {/* InterruptObject struct */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320", marginBottom: 16,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 16, textAlign: "center" }}>
                InterruptObject&lt;K: Kernel&gt;
              </div>
              <pre style={{
                margin: 0, fontSize: 11, lineHeight: 1.8, color: TEXT,
                background: "#080C14", padding: "16px 20px", borderRadius: 4,
                border: `1px solid ${DIM}`, overflow: "auto",
              }}>
{`pub struct InterruptObject<K: Kernel> {
    base: ObjectBase<K>,        // shared signal state
    ack_irqs: fn(Signals),      // generated per-object
}`}
              </pre>
            </div>

            {/* Methods */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320", marginBottom: 16,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 16, textAlign: "center" }}>
                KEY METHODS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: "12px 16px", border: `1px solid ${ORANGE}20`, borderRadius: 4, background: `${ORANGE}06` }}>
                  <div style={{ fontSize: 11, color: ORANGE, fontWeight: 700, marginBottom: 4 }}>
                    interrupt(&self, kernel, signal_mask)
                  </div>
                  <div style={{ fontSize: 10, color: TEXT }}>Called from ISR context — sets signal bits on the object via base.signal()</div>
                </div>
                <div style={{ padding: "12px 16px", border: `1px solid ${PURPLE}20`, borderRadius: 4, background: `${PURPLE}06` }}>
                  <div style={{ fontSize: 11, color: PURPLE, fontWeight: 700, marginBottom: 4 }}>
                    object_wait(&self, kernel, signal_mask, deadline)
                  </div>
                  <div style={{ fontSize: 10, color: TEXT }}>Blocks until requested interrupt signals are active</div>
                </div>
                <div style={{ padding: "12px 16px", border: `1px solid ${BAZEL}20`, borderRadius: 4, background: `${BAZEL}06` }}>
                  <div style={{ fontSize: 11, color: BAZEL, fontWeight: 700, marginBottom: 4 }}>
                    interrupt_ack(&self, kernel, signal_mask)
                  </div>
                  <div style={{ fontSize: 10, color: TEXT }}>Clears signal bits on object AND calls ack_irqs() to unmask at hardware controller</div>
                </div>
              </div>
            </div>

            {/* InterruptController trait */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320",
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14, textAlign: "center" }}>
                InterruptController TRAIT (ARM NVIC / RISC-V PLIC / VeerEL2 PIC)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {controllerMethods.map((m) => (
                  <div key={m.method} style={{
                    padding: "8px 12px", border: `1px solid ${DIM}`, borderRadius: 3,
                    background: "#0A0F1A",
                  }}>
                    <div style={{ fontSize: 10, color: RUST, fontWeight: 700, marginBottom: 2 }}>{m.method}</div>
                    <div style={{ fontSize: 9, color: TEXT }}>{m.purpose}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CODE GEN TAB ── */}
        {tab === "codegen" && (
          <div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320", marginBottom: 16,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14, textAlign: "center" }}>
                BUILD-TIME CODE GENERATION (JINJA TEMPLATES)
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {/* Template 1 */}
                <div style={{ flex: 1, padding: "16px", border: `1px solid ${ORANGE}20`, borderRadius: 4, background: `${ORANGE}06` }}>
                  <div style={{ fontSize: 11, color: ORANGE, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
                    interrupts.rs.jinja
                  </div>
                  <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.7 }}>
                    Generates <span style={{ color: ORANGE }}>ISR wrappers</span> and the interrupt table.
                    Each IRQ gets a wrapper that masks, signals, and reschedules.
                  </div>
                </div>
                {/* Template 2 */}
                <div style={{ flex: 1, padding: "16px", border: `1px solid ${PURPLE}20`, borderRadius: 4, background: `${PURPLE}06` }}>
                  <div style={{ fontSize: 11, color: PURPLE, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
                    objects/interrupt.rs.jinja
                  </div>
                  <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.7 }}>
                    Generates per-object setup: signal→IRQ mapping, static allocation,
                    and <span style={{ color: PURPLE }}>ack_irqs()</span> function.
                  </div>
                </div>
              </div>
            </div>

            {/* ack_irqs code */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320",
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14, textAlign: "center" }}>
                GENERATED ack_irqs() — MAPS SIGNALS BACK TO HARDWARE IRQs
              </div>
              <pre style={{
                margin: 0, fontSize: 11, lineHeight: 1.8, color: TEXT,
                background: "#080C14", padding: "16px 20px", borderRadius: 4,
                border: `1px solid ${DIM}`, overflow: "auto",
              }}>
{`fn ack_irqs(signal_mask: Signals) {
    // Generated table: signal bit index → HW IRQ number
    let signal_mask_table: [u32; N] = [irq0, irq1, ...];

    for (index, irq) in signal_mask_table.iter().enumerate() {
        let interrupt_bit = 1 << (16 + index);
        if signal_mask.contains(
            Signals::from_bits_retain(interrupt_bit)
        ) {
            InterruptController::userspace_interrupt_ack(*irq);
        }
    }
}`}
              </pre>
            </div>
          </div>
        )}

        {/* ── USAGE TAB ── */}
        {tab === "usage" && (
          <div>
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320", marginBottom: 16,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14, textAlign: "center" }}>
                USERSPACE PATTERN — UART INTERRUPT LISTENER
              </div>
              <pre style={{
                margin: 0, fontSize: 11, lineHeight: 1.8, color: TEXT,
                background: "#080C14", padding: "16px 20px", borderRadius: 4,
                border: `1px solid ${DIM}`, overflow: "auto",
              }}>
{`#[entry]
fn entry() -> ! {
    let mut uart = Uart::new(mapping::UART0_START_ADDRESS);

    loop {`}
                <span style={{ color: PURPLE }}>{`
        // 1. Block until UART interrupt fires`}</span>{`
        let wait_return = syscall::object_wait(
            handle::UART_INTERRUPTS,
            signals::UART0,
            Instant::MAX,
        ).unwrap();`}
                <span style={{ color: BLUE }}>{`

        // 2. Service the interrupt`}</span>{`
        let value = uart.read().unwrap();`}
                <span style={{ color: BAZEL }}>{`

        // 3. Ack — clears signals AND re-enables HW IRQ`}</span>{`
        syscall::interrupt_ack(
            handle::UART_INTERRUPTS,
            wait_return.pending_signals,
        );
    }
}`}
              </pre>
            </div>

            {/* Key points */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "24px 28px", background: "#0D1320",
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 14, textAlign: "center" }}>
                KEY POINTS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { color: PURPLE, text: "object_wait() blocks until requested interrupt signal(s) become active" },
                  { color: YELLOW, text: "pending_signals tells which IRQ(s) fired — multiple can fire between waits" },
                  { color: BAZEL, text: "interrupt_ack() clears signal bits AND unmasks the HW IRQ at controller" },
                  { color: RUST, text: "Until ack, the HW IRQ stays masked — no re-entry, no interrupt storms" },
                ].map((p, i) => (
                  <div key={i} style={{
                    padding: "10px 14px", border: `1px solid ${p.color}20`,
                    borderRadius: 3, background: `${p.color}06`,
                  }}>
                    <div style={{ fontSize: 10, color: TEXT, lineHeight: 1.6 }}>
                      <span style={{ color: p.color, marginRight: 6 }}>▸</span>{p.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
