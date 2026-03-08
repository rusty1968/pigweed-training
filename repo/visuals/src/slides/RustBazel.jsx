import { useState } from "react";

const ACCENT = "#FF4500";
const RUST = "#CE422B";
const BAZEL = "#00FFB2";
const DIM = "#1A2235";
const TEXT = "#94A3B8";
const BG = "#080C14";

const tabs = ["STRUCTURE", "MODULE.bazel", "BUILD FILE", "WORKFLOW"];

const fileTree = [
  { indent: 0, name: "my-rust-project/", type: "dir", note: "" },
  { indent: 1, name: "MODULE.bazel", type: "file", note: "Declares rules_rust", color: BAZEL },
  { indent: 1, name: "BUILD", type: "file", note: "Root build targets", color: BAZEL },
  { indent: 1, name: "src/", type: "dir", note: "" },
  { indent: 2, name: "main.rs", type: "file", note: "Entry point", color: RUST },
  { indent: 1, name: "lib/", type: "dir", note: "" },
  { indent: 2, name: "BUILD", type: "file", note: "Library targets", color: BAZEL },
  { indent: 2, name: "math.rs", type: "file", note: "", color: RUST },
  { indent: 2, name: "utils.rs", type: "file", note: "", color: RUST },
  { indent: 1, name: "tests/", type: "dir", note: "" },
  { indent: 2, name: "BUILD", type: "file", note: "Test targets", color: BAZEL },
  { indent: 2, name: "integration_test.rs", type: "file", note: "", color: RUST },
];

const moduleCode = `# ── 1. Declare the module ────────────────────────────
module(
    name = "my-rust-project",
    version = "0.1.0",
)

# ── 2. Add rules_rust dependency ─────────────────────
bazel_dep(name = "rules_rust", version = "0.40.0")

# ── 3. Register Rust toolchain ───────────────────────
rust = use_extension(
    "@rules_rust//rust:extensions.bzl",
    "rust",
)

rust.toolchain(
    edition = "2021",
    versions = ["1.75.0"],
)

use_repo(rust, "rust_toolchains")

register_toolchains("@rust_toolchains//:all")`;

const buildCode = `load("@rules_rust//rust:defs.bzl",
     "rust_binary", "rust_library", "rust_test")

# ── Binary target ────────────────────────────────────
rust_binary(
    name = "my_app",
    srcs = ["src/main.rs"],
    edition = "2021",
    deps = [
        "//lib:my_lib",
    ],
)

# ── Library target ───────────────────────────────────
rust_library(
    name = "my_lib",
    srcs = ["lib/math.rs", "lib/utils.rs"],
    edition = "2021",
    visibility = ["//visibility:public"],
)

# ── Unit tests ───────────────────────────────────────
rust_test(
    name = "my_lib_test",
    crate = ":my_lib",
)

# ── Integration test ─────────────────────────────────
rust_test(
    name = "integration_test",
    srcs = ["tests/integration_test.rs"],
    deps = [":my_lib"],
)`;

const workflowSteps = [
  {
    cmd: "bazel build //:my_app",
    color: BAZEL,
    label: "BUILD",
    desc: "Compiles the binary. Only recompiles what changed — fully incremental.",
    icon: "⚙",
  },
  {
    cmd: "bazel run //:my_app",
    color: "#38BDF8",
    label: "RUN",
    desc: "Builds then executes the binary in a hermetic sandbox.",
    icon: "▶",
  },
  {
    cmd: "bazel test //...",
    color: "#A78BFA",
    label: "TEST",
    desc: "Runs all rust_test targets. Results are cached — unchanged tests don't re-run.",
    icon: "✓",
  },
  {
    cmd: "bazel query 'deps(//:my_app)'",
    color: RUST,
    label: "QUERY",
    desc: "Inspect the full dependency graph of any target.",
    icon: "◎",
  },
];

export default function RustBazel() {
  const [tab, setTab] = useState(0);
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "'Courier New', monospace",
      color: "#E2E8F0", padding: "40px 24px",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 10 }}>
          BUILD SYSTEM · LANGUAGE INTEGRATION
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 6 }}>
          <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: 6, color: RUST }}>RUST</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
            <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${RUST}, ${BAZEL})` }} />
            <div style={{ fontSize: 8, letterSpacing: 3, color: "#334155" }}>WITH</div>
            <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${RUST}, ${BAZEL})` }} />
          </div>
          <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: 6, color: BAZEL }}>BAZEL</span>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#334155" }}>MANAGING RUST PROJECTS AT SCALE</div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0, marginBottom: 28,
        border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden",
        width: "100%", maxWidth: 780,
      }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            flex: 1, background: tab === i ? `${BAZEL}12` : "transparent",
            border: "none", borderRight: i < tabs.length - 1 ? `1px solid ${DIM}` : "none",
            color: tab === i ? BAZEL : "#334155",
            fontFamily: "'Courier New', monospace",
            fontSize: 10, letterSpacing: 3, padding: "10px 4px",
            cursor: "pointer", transition: "all 0.2s",
            borderBottom: tab === i ? `2px solid ${BAZEL}` : "2px solid transparent",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 780 }}>

        {/* STRUCTURE TAB */}
        {tab === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* File tree */}
            <div style={{ border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                background: "#0D1320", borderBottom: `1px solid ${DIM}`,
                padding: "10px 16px", fontSize: 9, letterSpacing: 3, color: "#334155",
                display: "flex", justifyContent: "space-between"
              }}>
                <span>PROJECT STRUCTURE</span>
                <span style={{ color: RUST }}>rules_rust</span>
              </div>
              <div style={{ padding: "16px", background: "#050810" }}>
                {fileTree.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "3px 0",
                    paddingLeft: f.indent * 16,
                  }}>
                    <span style={{ color: f.type === "dir" ? "#38BDF8" : (f.color || TEXT), fontSize: 12 }}>
                      {f.type === "dir" ? "📁" : "📄"}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: f.type === "dir" ? "#38BDF8" : (f.color || TEXT),
                      fontWeight: f.color === BAZEL ? 700 : 400,
                    }}>{f.name}</span>
                    {f.note && (
                      <span style={{ fontSize: 9, color: "#334155", letterSpacing: 1 }}>← {f.note}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key concepts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { color: BAZEL, title: "MODULE.bazel", body: "Root file that declares dependencies via Bzlmod. Uses bazel_dep() and use_extension() instead of legacy WORKSPACE loads." },
                { color: BAZEL, title: "BUILD files", body: "Define rust_binary, rust_library, and rust_test targets. One per directory that contains sources." },
                { color: RUST, title: "rust_binary", body: "Produces a compiled executable. Maps to your main.rs entry point." },
                { color: "#A78BFA", title: "rust_library", body: "A reusable crate. Other targets depend on it via the deps attribute." },
              ].map((c) => (
                <div key={c.title} style={{
                  border: `1px solid ${c.color}30`, borderRadius: 4,
                  padding: "12px 16px", background: `${c.color}08`, position: "relative",
                }}>
                  <div style={{ position: "absolute", top: -1, left: 16, right: 60, height: 1, background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
                  <div style={{ fontSize: 10, letterSpacing: 3, color: c.color, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.6 }}>{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE.bazel TAB */}
        {tab === 1 && (
          <div style={{ border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              background: "#0D1320", borderBottom: `1px solid ${DIM}`,
              padding: "10px 16px", fontSize: 9, letterSpacing: 3,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "#334155" }}>MODULE.bazel</span>
              <span style={{ color: BAZEL }}>Starlark</span>
            </div>
            <div style={{ padding: "24px", background: "#050810", overflowX: "auto" }}>
              <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: TEXT }}>
                {moduleCode.split("\n").map((line, i) => {
                  const isComment = line.trim().startsWith("#");
                  const isLoad = line.trim().startsWith("load(") || line.trim().startsWith("use_extension(");
                  const isKey = line.includes("name =") || line.includes("edition =") || line.includes("versions =") || line.includes("version =");
                  return (
                    <div key={i} style={{
                      color: isComment ? "#334155" : isLoad ? BAZEL : isKey ? "#38BDF8" : TEXT,
                      fontStyle: isComment ? "italic" : "normal",
                    }}>{line}</div>
                  );
                })}
              </pre>
            </div>
          </div>
        )}

        {/* BUILD FILE TAB */}
        {tab === 2 && (
          <div style={{ border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              background: "#0D1320", borderBottom: `1px solid ${DIM}`,
              padding: "10px 16px", fontSize: 9, letterSpacing: 3,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "#334155" }}>BUILD</span>
              <span style={{ color: RUST }}>rust targets</span>
            </div>
            <div style={{ padding: "24px", background: "#050810", overflowX: "auto" }}>
              <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.8 }}>
                {buildCode.split("\n").map((line, i) => {
                  const isComment = line.trim().startsWith("#");
                  const isLoad = line.trim().startsWith("load(");
                  const isRule = ["rust_binary(", "rust_library(", "rust_test("].some(r => line.trim().startsWith(r));
                  const isAttr = line.includes("name =") || line.includes("srcs =") || line.includes("deps =") || line.includes("edition =") || line.includes("visibility =") || line.includes("crate =");
                  return (
                    <div key={i} style={{
                      color: isComment ? "#334155" : isLoad ? BAZEL : isRule ? RUST : isAttr ? "#38BDF8" : TEXT,
                      fontStyle: isComment ? "italic" : "normal",
                      fontWeight: isRule ? 700 : 400,
                    }}>{line}</div>
                  );
                })}
              </pre>
            </div>
          </div>
        )}

        {/* WORKFLOW TAB */}
        {tab === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {workflowSteps.map((s, i) => (
              <div key={i} onClick={() => setActiveStep(activeStep === i ? null : i)} style={{
                border: `1px solid ${activeStep === i ? s.color : DIM}`,
                borderRadius: 4, padding: "16px 20px", cursor: "pointer",
                background: activeStep === i ? `${s.color}10` : "#0D1320",
                transition: "all 0.2s",
                boxShadow: activeStep === i ? `0 0 16px ${s.color}25` : "none",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{
                    fontSize: 18, color: s.color, minWidth: 28,
                    textShadow: `0 0 10px ${s.color}`,
                  }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, letterSpacing: 3, color: s.color, fontWeight: 700 }}>{s.label}</span>
                      <div style={{ width: 1, height: 12, background: DIM }} />
                      <span style={{ fontSize: 11, color: TEXT }}>{s.desc}</span>
                    </div>
                    <div style={{
                      background: "#050810", border: `1px solid ${DIM}`,
                      borderRadius: 3, padding: "8px 14px",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 12, color: s.color,
                      whiteSpace: "pre",
                    }}>{`$ ${s.cmd}`}</div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{
              marginTop: 8, border: `1px solid ${DIM}`, borderRadius: 4,
              padding: "16px 20px", background: "#050810",
            }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 12 }}>── TARGET SYNTAX ──</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { syntax: "//:my_app", desc: "Root package target" },
                  { syntax: "//lib:my_lib", desc: "Named package target" },
                  { syntax: "//...", desc: "All targets everywhere" },
                ].map((t) => (
                  <div key={t.syntax} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: BAZEL, marginBottom: 4 }}>{t.syntax}</div>
                    <div style={{ fontSize: 10, color: "#334155", letterSpacing: 1 }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 28, fontSize: 9, letterSpacing: 3, color: "#1E2D45", textAlign: "center" }}>
        CLICK TABS TO EXPLORE  ·  rules_rust by bazelbuild
      </div>
    </div>
  );
}
