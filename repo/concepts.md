MODULE.bazel
│
├── module()
│     └── identifies your project
│
├── bazel_dep()  ──────────────────────► fetches rules_rust from registry
│                                              │
└── use_extension()  ◄──────────────────────────
      │
      ├── .toolchain()  ──────► downloads rustc + std for target triples
      │                               │
      └── use_repo()  ◄───────────────
            │
            └── makes "rust_toolchains" visible to your module
                        │
                        ▼
              register_toolchains()  ──────► tells Bazel "use these to compile"


BUILD.bazel
│
└── load()  ──────────────────────────► imports rust_library rule from rules_rust
      │
      └── rust_library()
            │
            ├── srcs  ──────────────► src/lib.rs  (#![no_std])
            ├── edition  ──────────► 2021
            └── platform  ─────────► thumbv7em-none-eabihf
                                            │
                                            └── Cortex-M4 target