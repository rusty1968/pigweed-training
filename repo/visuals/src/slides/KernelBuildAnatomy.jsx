import { useState } from "react";

const BAZEL = "#00FFB2";
const RUST = "#CE422B";
const PURPLE = "#A78BFA";
const BLUE = "#38BDF8";
const ORANGE = "#FF6B35";
const DIM = "#1A2235";
const TEXT = "#94A3B8";

const layers = [
  {
    id: "module",
    label: "MODULE.bazel",
    color: BAZEL,
    desc: "bzlmod dependency graph",
    detail: "pw_kernel uses bzlmod (not WORKSPACE). Dependencies like rules_rust, freertos, and boringssl are declared as bazel_dep() entries with versions resolved from the Bazel Central Registry.",
    code: `bazel_dep(name = "rules_rust", version = "0.56.0")
rust = use_extension("@rules_rust//rust:extensions.bzl", "rust")
rust.toolchain(
    edition = "2024",
    extra_target_triples = ["thumbv8m.main-none-eabihf"],
)`,
  },
  {
    id: "platforms",
    label: "PLATFORMS + select()",
    color: ORANGE,
    desc: "multi-target architecture",
    detail: "Each target board (mps2_an505, qemu_virt_riscv32, pw_rp2350) defines a Bazel platform with CPU/OS constraints. Code uses select() to pick the right source, deps, and flags per architecture.",
    code: `# target/mps2_an505/BUILD.bazel
platform(
    name = "mps2_an505",
    constraint_values = [
        "@platforms//cpu:armv8-m",
        "@platforms//os:none",
    ],
)

# kernel/BUILD.bazel — arch-conditional deps
rust_library(
    name = "kernel",
    deps = select({
        "@platforms//cpu:armv8-m":  ["//pw_kernel/arch/arm_cortex_m"],
        "@platforms//cpu:riscv32": ["//pw_kernel/arch/riscv"],
        "//conditions:default":    ["//pw_kernel/arch/host"],
    }),
)`,
  },
  {
    id: "rules",
    label: "CUSTOM .bzl RULES",
    color: PURPLE,
    desc: "kernel-specific build logic",
    detail: "pw_kernel defines custom Starlark rules: system_image combines kernel + apps into an .elf, target_codegen generates Rust from JSON5 configs, and target_linker_script renders .ld files from Jinja2 templates.",
    code: `# tooling/system_image.bzl
system_image(
    name = "my_app_image",
    kernel = "//pw_kernel/kernel",
    apps = [":my_app"],
    platform = "//pw_kernel/target/mps2_an505",
)
# → outputs: my_app_image.elf, my_app_image.bin`,
  },
  {
    id: "transitions",
    label: "TRANSITIONS",
    color: BLUE,
    desc: "build-time flag switching",
    detail: "system_image uses Bazel transitions to redirect the build platform and inject flags (userspace mode, system config path) without the user passing --config flags manually. This lets one bazel build command compile kernel + apps for different constraint sets.",
    code: `# The system_image rule internally does:
#   1. Switch --platforms to the target board
#   2. Set --//pw_kernel/config:system_config
#   3. Enable --//pw_kernel/userspace:userspace_build
# All transparent to the caller.`,
  },
];

export default function KernelBuildAnatomy() {
  const [active, setActive] = useState(null);

  return (
    <div style={{
      minHeight: "100vh", background: "#080C14",
      fontFamily: "'Courier New', monospace", color: "#E2E8F0",
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#334155", marginBottom: 10 }}>
          pw_kernel BUILD SYSTEM
        </div>
        <div style={{
          fontSize: 32, fontWeight: 900, letterSpacing: 6,
          background: "linear-gradient(135deg, #00FFB2, #A78BFA)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 6,
        }}>BUILD ANATOMY</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A5568" }}>
          FOUR LAYERS YOU'LL ENCOUNTER
        </div>
      </div>

      {/* Layer stack */}
      <div style={{ width: "100%", maxWidth: 780, display: "flex", flexDirection: "column", gap: 8 }}>
        {layers.map((layer, i) => (
          <div key={layer.id}>
            <div
              onClick={() => setActive(active === layer.id ? null : layer.id)}
              style={{
                border: `1px solid ${active === layer.id ? layer.color : DIM}`,
                borderRadius: 4, cursor: "pointer",
                background: active === layer.id ? `${layer.color}10` : "#0D1320",
                transition: "all 0.2s",
                boxShadow: active === layer.id ? `0 0 16px ${layer.color}25` : "none",
                overflow: "hidden",
              }}
            >
              {/* Header row */}
              <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  fontSize: 10, color: layer.color, letterSpacing: 2,
                  minWidth: 20, textAlign: "center", opacity: 0.6,
                }}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: layer.color, boxShadow: `0 0 8px ${layer.color}`,
                }} />
                <div style={{ fontSize: 12, letterSpacing: 3, color: layer.color, fontWeight: 700 }}>
                  {layer.label}
                </div>
                <div style={{ width: 1, height: 14, background: DIM }} />
                <div style={{ fontSize: 11, color: TEXT, letterSpacing: 1 }}>
                  {layer.desc}
                </div>
                <div style={{ marginLeft: "auto", fontSize: 10, color: "#334155" }}>
                  {active === layer.id ? "\u25B4" : "\u25BE"}
                </div>
              </div>

              {/* Expanded detail */}
              {active === layer.id && (
                <div style={{ borderTop: `1px solid ${layer.color}30` }}>
                  <div style={{ padding: "14px 20px", fontSize: 11, color: TEXT, lineHeight: 1.7, letterSpacing: 0.3 }}>
                    {layer.detail}
                  </div>
                  <div style={{ padding: "0 20px 16px 20px" }}>
                    <pre style={{
                      margin: 0, padding: "14px 16px",
                      background: "#050810", border: `1px solid ${DIM}`,
                      borderRadius: 3, fontSize: 11, lineHeight: 1.8,
                      overflowX: "auto",
                    }}>
                      {layer.code.split("\n").map((line, j) => {
                        const isComment = line.trim().startsWith("#");
                        const isKey = /^\s*(name|version|edition|extra_target_triples|constraint_values|deps|kernel|apps|platform|srcs)\s*=/.test(line);
                        const isArch = /armv8-m|riscv32|thumbv8m|cortex|Cortex/.test(line);
                        return (
                          <div key={j} style={{
                            color: isComment ? "#334155" : isArch ? RUST : isKey ? BLUE : TEXT,
                            fontStyle: isComment ? "italic" : "normal",
                            fontWeight: isArch ? 700 : 400,
                          }}>{line || "\u00A0"}</div>
                        );
                      })}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Connector line between layers */}
            {i < layers.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}>
                <div style={{ width: 1, height: 8, background: DIM }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, fontSize: 9, letterSpacing: 3, color: "#1E2D45", textAlign: "center" }}>
        CLICK ANY LAYER TO EXPAND · REAL pw_kernel PATTERNS
      </div>
    </div>
  );
}
