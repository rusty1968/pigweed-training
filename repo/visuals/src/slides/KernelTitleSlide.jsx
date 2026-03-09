export default function KernelTitleSlide() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080C14",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      color: "#E2E8F0",
      textAlign: "center",
      padding: "40px",
    }}>
      <div style={{ fontSize: 11, letterSpacing: 6, color: "#4A5568", marginBottom: 16 }}>
        INTERNAL DEVELOPER TRAINING
      </div>

      <div style={{
        fontSize: 56, fontWeight: 900, letterSpacing: 8,
        background: "linear-gradient(135deg, #A78BFA, #FF6B35)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: 8,
      }}>pw_kernel</div>

      <div style={{ fontSize: 16, letterSpacing: 4, color: "#4A5568", marginBottom: 60 }}>
        KERNEL INTERNALS
      </div>

      <div style={{
        width: 1, height: 60,
        background: "linear-gradient(180deg, #A78BFA, transparent)",
        marginBottom: 40,
      }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
        {[
          { n: "01", label: "Kernel Objects — The Building Blocks" },
          { n: "02", label: "Threads & Processes — Execution Model" },
          { n: "03", label: "Channel IPC — Overview" },
          { n: "04", label: "Signal State Machine" },
          { n: "05", label: "Channels in Code — Config & Syscalls" },
          { n: "06", label: "Wait Groups — Multiplexed Waiting" },
        ].map((item) => (
          <div key={item.n} style={{
            display: "flex", alignItems: "center", gap: 16,
            border: "1px solid #1A2235", borderRadius: 4,
            padding: "12px 20px", background: "#0D1320",
          }}>
            <div style={{ fontSize: 10, color: "#A78BFA", letterSpacing: 2, minWidth: 24 }}>{item.n}</div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#64748B" }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 60, fontSize: 10, letterSpacing: 3, color: "#2D3F55" }}>
        USE ARROW KEYS OR CLICK → TO NAVIGATE
      </div>
    </div>
  );
}
