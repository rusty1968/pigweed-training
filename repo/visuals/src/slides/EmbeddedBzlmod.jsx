import { useState } from "react";

const BAZEL = "#00FFB2";
const RUST = "#CE422B";
const DIM = "#1A2235";
const TEXT = "#94A3B8";
const BG = "#080C14";
const PURPLE = "#A78BFA";

const moduleSections = [
  {
    id: "module",
    label: "module()",
    color: BAZEL,
    desc: "Identifies your project",
    code: `module(
    name = "my_embedded_project",
    version = "0.1.0",
)`,
  },
  {
    id: "dep",
    label: "bazel_dep()",
    color: "#38BDF8",
    desc: "Fetches rules_rust from registry",
    code: `bazel_dep(
    name = "rules_rust",
    version = "0.40.0",
)`,
    arrow: "→ fetches rules_rust from registry",
  },
  {
    id: "ext",
    label: "use_extension()",
    color: PURPLE,
    desc: "Configures Rust toolchain for embedded targets",
    code: `rust = use_extension(
    "@rules_rust//rust:extensions.bzl",
    "rust",
)

rust.toolchain(
    edition = "2021",
    versions = ["1.75.0"],
    extra_target_triples = [
        "thumbv7em-none-eabihf",   # Cortex-M4
    ],
)

use_repo(rust, "rust_toolchains")

register_toolchains(
    "@rust_toolchains//:all",
)`,
    arrow: "→ downloads rustc + std for target triples",
  },
];

const buildSections = [
  {
    id: "load",
    label: "load()",
    color: BAZEL,
    desc: "Imports rust_library rule from rules_rust",
    code: `load("@rules_rust//rust:defs.bzl", "rust_library")`,
  },
  {
    id: "target",
    label: "rust_library()",
    color: RUST,
    desc: "Embedded library targeting Cortex-M4",
    code: `rust_library(
    name = "firmware_core",
    srcs = ["src/lib.rs"],       # #![no_std]
    edition = "2021",
    platform = "thumbv7em-none-eabihf",
                                  # Cortex-M4 target
)`,
  },
];

const tabs = ["MODULE.bazel", "BUILD.bazel", "FLOW"];

export default function EmbeddedBzlmod() {
  const [tab, setTab] = useState(0);
  const [activeSection, setActiveSection] = useState(null);

  const sections = tab === 0 ? moduleSections : tab === 1 ? buildSections : [];

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
          MODERN BAZEL · EMBEDDED TARGETS
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: 6, color: BAZEL }}>BZLMOD</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
            <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${BAZEL}, ${RUST})` }} />
            <div style={{ fontSize: 8, letterSpacing: 3, color: "#334155" }}>+</div>
            <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${BAZEL}, ${RUST})` }} />
          </div>
          <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: 6, color: RUST }}>#![no_std]</span>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#334155" }}>MODULE.bazel FOR CORTEX-M4 RUST</div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0, marginBottom: 28,
        border: `1px solid ${DIM}`, borderRadius: 4, overflow: "hidden",
        width: "100%", maxWidth: 780,
      }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => { setTab(i); setActiveSection(null); }} style={{
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
        {/* MODULE.bazel and BUILD.bazel tabs */}
        {tab < 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sections.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
                style={{
                  border: `1px solid ${activeSection === s.id ? s.color : DIM}`,
                  borderRadius: 4, cursor: "pointer",
                  background: activeSection === s.id ? `${s.color}10` : "#0D1320",
                  transition: "all 0.2s",
                  boxShadow: activeSection === s.id ? `0 0 16px ${s.color}25` : "none",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                    <span style={{ fontSize: 12, letterSpacing: 3, color: s.color, fontWeight: 700 }}>{s.label}</span>
                    <div style={{ width: 1, height: 12, background: DIM }} />
                    <span style={{ fontSize: 11, color: TEXT }}>{s.desc}</span>
                  </div>
                  {s.arrow && (
                    <div style={{ fontSize: 10, color: "#334155", letterSpacing: 1, marginLeft: 20, marginTop: 4 }}>{s.arrow}</div>
                  )}
                </div>
                {activeSection === s.id && (
                  <div style={{
                    borderTop: `1px solid ${s.color}30`,
                    padding: "16px 20px", background: "#050810",
                  }}>
                    <pre style={{
                      margin: 0, fontSize: 12, lineHeight: 1.8, color: TEXT,
                      overflowX: "auto",
                    }}>
                      {s.code.split("\n").map((line, i) => {
                        const isComment = line.trim().startsWith("#");
                        const isKey = /^\s*(name|version|edition|versions|extra_target_triples|srcs|platform)\s*=/.test(line);
                        const isTarget = line.includes("thumbv7em") || line.includes("Cortex-M4");
                        const isNoStd = line.includes("no_std");
                        return (
                          <div key={i} style={{
                            color: isComment ? "#334155" : isTarget ? RUST : isNoStd ? RUST : isKey ? "#38BDF8" : TEXT,
                            fontStyle: isComment ? "italic" : "normal",
                            fontWeight: isTarget ? 700 : 400,
                          }}>{line}</div>
                        );
                      })}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* FLOW tab — visual diagram from concepts.md */}
        {tab === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* MODULE.bazel flow */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: "4px 4px 0 0",
              overflow: "hidden",
            }}>
              <div style={{
                background: "#0D1320", borderBottom: `1px solid ${DIM}`,
                padding: "10px 16px", fontSize: 9, letterSpacing: 3,
                display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ color: BAZEL }}>MODULE.bazel</span>
                <span style={{ color: "#334155" }}>dependency resolution</span>
              </div>
              <div style={{ padding: "24px 28px", background: "#050810" }}>
                {[
                  { label: "module()", desc: "identifies your project", color: BAZEL, indent: 0 },
                  { label: "bazel_dep()", desc: "fetches rules_rust from registry", color: "#38BDF8", indent: 0, arrow: true },
                  { label: "use_extension()", desc: "configures the Rust extension", color: PURPLE, indent: 0 },
                  { label: ".toolchain()", desc: "downloads rustc + std for target triples", color: PURPLE, indent: 1, arrow: true },
                  { label: "use_repo()", desc: "makes \"rust_toolchains\" visible to your module", color: PURPLE, indent: 1 },
                  { label: "register_toolchains()", desc: "tells Bazel \"use these to compile\"", color: BAZEL, indent: 2, arrow: true },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    paddingLeft: item.indent * 24,
                    marginBottom: 12,
                  }}>
                    {item.arrow && (
                      <div style={{
                        position: "relative", marginLeft: -20,
                        color: item.color, fontSize: 12, marginRight: -8,
                      }}>▸</div>
                    )}
                    <div style={{
                      fontSize: 11, letterSpacing: 2, color: item.color,
                      fontWeight: 700, minWidth: 180,
                      background: `${item.color}10`, border: `1px solid ${item.color}30`,
                      borderRadius: 3, padding: "4px 10px",
                    }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: "#4A5568", letterSpacing: 1 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connector */}
            <div style={{
              display: "flex", justifyContent: "center", padding: "8px 0",
              background: BG,
            }}>
              <div style={{
                width: 2, height: 32,
                background: `linear-gradient(180deg, ${BAZEL}, ${RUST})`,
              }} />
            </div>

            {/* BUILD.bazel flow */}
            <div style={{
              border: `1px solid ${DIM}`, borderRadius: "0 0 4px 4px",
              overflow: "hidden",
            }}>
              <div style={{
                background: "#0D1320", borderBottom: `1px solid ${DIM}`,
                padding: "10px 16px", fontSize: 9, letterSpacing: 3,
                display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ color: RUST }}>BUILD.bazel</span>
                <span style={{ color: "#334155" }}>target definition</span>
              </div>
              <div style={{ padding: "24px 28px", background: "#050810" }}>
                {[
                  { label: "load()", desc: "imports rust_library rule from rules_rust", color: BAZEL, indent: 0, arrow: true },
                  { label: "rust_library()", desc: "", color: RUST, indent: 0 },
                  { label: "srcs", desc: "src/lib.rs  (#![no_std])", color: TEXT, indent: 1 },
                  { label: "edition", desc: "2021", color: TEXT, indent: 1 },
                  { label: "platform", desc: "thumbv7em-none-eabihf → Cortex-M4", color: RUST, indent: 1 },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    paddingLeft: item.indent * 24,
                    marginBottom: 10,
                  }}>
                    {item.arrow && (
                      <div style={{
                        position: "relative", marginLeft: -20,
                        color: item.color, fontSize: 12, marginRight: -8,
                      }}>▸</div>
                    )}
                    <div style={{
                      fontSize: 11, letterSpacing: 2, color: item.color,
                      fontWeight: 700, minWidth: item.indent > 0 ? 80 : 180,
                      background: `${item.color}10`, border: `1px solid ${item.color}30`,
                      borderRadius: 3, padding: "4px 10px",
                    }}>{item.label}</div>
                    {item.desc && (
                      <div style={{
                        fontSize: 10, letterSpacing: 1,
                        color: item.label === "platform" ? RUST : "#4A5568",
                        fontWeight: item.label === "platform" ? 700 : 400,
                      }}>{item.desc}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 28, fontSize: 9, letterSpacing: 3, color: "#1E2D45", textAlign: "center" }}>
        CLICK SECTIONS TO EXPAND CODE  ·  BZLMOD REPLACES WORKSPACE
      </div>
    </div>
  );
}
