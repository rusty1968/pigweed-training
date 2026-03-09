# pw_kernel Architecture

## Microkernel Design

pw_kernel is a **microkernel**. Only the minimum trusted computing base runs in
kernel space; everything else — including device drivers — runs as isolated
userspace processes.

### What's in the kernel

| Component | Purpose |
|-----------|---------|
| Preemptive scheduler | Process/thread management |
| IPC channels | Zero-copy message passing between processes |
| Synchronization primitives | Spinlocks, mutexes, events |
| Interrupt routing | Signal an object, wake a thread |
| Memory isolation | Hardware-enforced (ARM MPU / RISC-V PMP) |

### What's NOT in the kernel

- No file system
- No networking stack
- No device drivers
- No general services

## Microkernel Evidence

| Characteristic | pw_kernel |
|---|---|
| Minimal kernel TCB | Only scheduling, IPC, memory isolation, interrupt routing |
| Drivers in userspace | MMIO mappings + interrupt objects per process |
| IPC-based communication | Channels with zero-copy buffer passing |
| Per-process memory isolation | Hardware-enforced (MPU/PMP) |
| Services as separate processes | Statically composed at build time |

### Device drivers in userspace

Userspace processes get direct MMIO access through per-process memory mappings
and receive hardware interrupts via `InterruptObject` signals. The kernel never
touches device hardware. Example: the UART driver in
`tests/uart/user/uart_listener.rs` accesses the UART through
`mapping::UART0_START_ADDRESS`, waits on interrupt signals, and communicates
results over an IPC channel.

### Why it's NOT a hybrid kernel

A hybrid kernel pulls performance-critical services (drivers, file systems)
**back into kernel space** to avoid IPC overhead. pw_kernel does the opposite —
even device drivers run as isolated userspace processes. All cross-process
communication goes through IPC channel syscalls. There are no kernel-space
"services" beyond the core primitives.

## Two Operating Modes

1. **Protected mode** — true microkernel with hardware memory isolation
   (ARM MPU / RISC-V PMP). Clear kernel/user distinction with per-process
   memory access validation.

2. **Lightweight mode** — RTOS-like operation for resource-constrained devices.
   No hardware isolation, but still uses the same microkernel scheduler and
   IPC primitives.

## System Composition

Systems are defined at **build time** through the system generator
(`tooling/system_generator/`). Each process is statically configured with:

- Thread allocations and stack sizes
- Object handle tables (channels, interrupt objects, wait groups)
- Memory mappings (code, data, device MMIO regions)
- IPC channel wiring between processes

All kernel data structures are **statically allocated** — there is no dynamic
memory allocation at runtime.
