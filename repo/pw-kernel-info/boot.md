# pw_kernel Boot Sequence

## Boot Flow

```
Hardware reset
  → entry point (cortex_m_rt::entry / riscv entry.rs)
    → kernel::main(Arch, &mut INIT_STATE)
      → InterruptController::early_init()
      → target::console_init()
      → scheduler::initialize()
      → creates bootstrap thread + idle thread
      → scheduler::bootstrap_scheduler()
        → [now in thread context]
        → kernel.init()
        → target::main()                 ← application entry point
```

## Stage 1: Hardware Entry

The platform-specific entry point (`target/<platform>/entry.rs`) runs first:

- Initializes minimal hardware (e.g., clocks, memory)
- Allocates `InitKernelState` via `kernel::static_init_state!()` — this provides
  static storage for the bootstrap and idle thread stacks
- Calls `kernel::main(Arch, &mut INIT_STATE)`

## Stage 2: `kernel::main()`

`kernel::main()` (`kernel/lib.rs`) runs in a non-thread context with preemption
disabled:

1. **`InterruptController::early_init()`** — platform interrupt controller setup
2. **`target::console_init()`** — debug console initialization
3. **`scheduler::initialize()`** — prepare the scheduler data structures
4. **Create bootstrap thread** — the first thread, with `DEFAULT_PRIORITY`
5. **`scheduler::bootstrap_scheduler()`** — context-switches into the bootstrap
   thread (never returns)

## Stage 3: Bootstrap Thread

Now running in thread context with interrupts enabled:

1. **`kernel.init()`** — arch-specific kernel initialization
2. **Create idle thread** — lowest priority, runs `kernel.idle()` in a loop
3. **Start idle thread** — added to the scheduler's run queue
4. **`target::main()`** — hands off to the target-specific application code

## Stage 4: `target::main()`

Each target implements `TargetInterface` and provides `main() -> !`. There are
two patterns:

### Userspace targets — `codegen::start()`

```rust
fn main() -> ! {
    codegen::start();   // generated from system.rs.jinja
    loop {}
}
```

`codegen::start()` is generated code (`tooling/system_generator/templates/system.rs.jinja`)
that performs all system composition:

1. **Create kernel objects** — channel handlers/initiators, interrupt objects
   (with IRQ-to-signal mappings, enables hardware IRQs), wait groups
2. **Build per-process memory configs** — code regions, data regions, device
   MMIO mappings
3. **Assemble object handle tables** — per-process array of `dyn KernelObject`
   references indexed by handle
4. **Create processes** — with their memory config and object table
5. **Create and start threads** — attached to processes, with configured stack
   sizes and priorities

### Kernel-only targets (no userspace)

```rust
fn main() -> ! {
    // kernel threads test
    threads::main(Arch, unsafe { &mut APP_STATE });
    // or kernel UART test
    uart_16550_kernel::init(&UARTS);
    test_uart::main::<Arch, TargetUart>(Arch);
    loop {}
}
```

These run test logic directly in kernel space without creating userspace processes.

## The `TargetInterface` Trait

Defined in `target/target_common.rs`:

```rust
pub trait TargetInterface {
    const NAME: &'static str;       // target name for logging
    fn console_init() {}            // optional: set up debug console
    fn main() -> !;                 // required: start the application
    fn shutdown(code: u32) -> !;    // optional: quit (semihosting exit, etc.)
}
```

The `declare_target!(Target)` macro exports these as `#[no_mangle]` symbols
(`pw_kernel_target_main`, `pw_kernel_target_console_init`, etc.) that the kernel
calls through `kernel/target.rs`.

## `InitKernelState`

Allocated via `kernel::static_init_state!()` at the entry point:

```rust
pub struct InitKernelState<K: Kernel> {
    pub bootstrap_thread: ThreadStorage<K>,  // thread + stack
    pub idle_thread: ThreadStorage<K>,       // thread + stack
}
```

Stack sizes come from `KernelConfig::KERNEL_STACK_SIZE_BYTES`. Stacks are placed
in `.bss` (zero-initialized) to avoid inflating binary size.

## Where to Put Pin Mux / Board Init Code

There are three insertion points, depending on when the pin mux is needed:

| When | Where | Use case |
|------|-------|----------|
| Before kernel boots | `entry.rs`, before `kernel::main()` | Clock-gating, pins for debug UART |
| After kernel init, before app | `TargetInterface::console_init()` | Console UART pin mux |
| After scheduler is running | `TargetInterface::main()` | Peripheral pins for userspace drivers |

### In `entry.rs` — boot-critical pin mux

For pins needed **before the kernel is running** (e.g., the debug console UART),
configure them alongside clock init in the platform entry point. The STM32F407
target does this: `entry.rs` calls `init_clocks()` before `kernel::main()`, and
`console.rs` configures PA2 as AF7 (USART2_TX) with GPIO MODER, OTYPER, and AFRL
registers.

```
entry.rs::main()
  → init_clocks()         ← clock setup
  → init_pin_mux()        ← board-level pin mux HERE
  → kernel::main(...)
```

### In `console_init()` — console-related pin mux

The STM32F407 console backend (`target/stm32f407/console.rs`) configures GPIO
clocks, pin mode, and alternate function inside its `init()` function, called
from `TargetInterface::console_init()`. This runs early in `kernel::main()`
before the scheduler starts.

### In `target::main()` — application peripheral pin mux

`TargetInterface::main()` is where userspace processes are **created** — the call
to `codegen::start()` inside it instantiates all processes and starts their
threads. Code placed before `codegen::start()` runs before any userspace driver
exists, making it suitable for peripheral pin mux that drivers depend on.

**General guidance**: Pin mux is board-level hardware config. For most cases,
`entry.rs` next to `init_clocks()` is the right spot — do it once, early,
before anything tries to use the pins.

## Abstraction Layers (No Board Abstraction)

pw_kernel has **no board abstraction**. The abstraction layers are:

| Trait | Level | What it covers |
|-------|-------|----------------|
| `Arch` | Architecture | Context switching, clocks, atomics, thread state, interrupt controller type |
| `InterruptController` | Interrupt controller | NVIC, PLIC, VeerEL2 PIC |
| `TargetInterface` | Target entry point | `name`, `console_init`, `main`, `shutdown` |

Board-specific code (clocks, pin mux, memory layout, peripheral addresses) lives
directly in `target/<platform>/` files with no abstraction:

| File | Content |
|------|---------|
| `entry.rs` | Clock init, raw MMIO register writes |
| `console.rs` | GPIO pin config, UART register setup |
| `config.rs` | Clock frequencies, stack sizes |
| `system.json5` | Memory map, process layout |

Each target folder (e.g., `stm32f407/`, `qemu_virt_riscv32/`, `pw_rp2350/`) is
a self-contained board support package, but there is no shared `Board` trait or
BSP interface. To port to a new board, copy an existing target folder and modify
the raw hardware init code directly.
