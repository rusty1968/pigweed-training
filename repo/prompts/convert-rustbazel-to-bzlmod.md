In `visuals/src/slides/RustBazel.jsx`, the slide currently uses the legacy WORKSPACE approach (http_archive, rust_register_toolchains, crates_repository). Convert it to use the modern Bzlmod approach with MODULE.bazel. Specifically:

1. Replace the `workspaceCode` string with a `moduleCode` string showing `module()`, `bazel_dep(name = "rules_rust")`, `use_extension()` with `rust.toolchain()`, `use_repo()`, and `register_toolchains()`.
2. Rename the "WORKSPACE" tab to "MODULE.bazel" and update its rendering to use `moduleCode`.
3. Keep the BUILD FILE, STRUCTURE, and WORKFLOW tabs as-is — those are still valid under Bzlmod.
4. In the STRUCTURE tab's file tree, replace the `WORKSPACE` entry with `MODULE.bazel` and remove `Cargo.toml` / `Cargo.lock` entries (crate_universe is not used in this example).
5. In the STRUCTURE tab's key concepts sidebar, replace the "WORKSPACE" card with a "MODULE.bazel" card explaining Bzlmod, and remove the "crate_universe" card.
6. Keep the same visual style (colors, fonts, layout) — only change content.
