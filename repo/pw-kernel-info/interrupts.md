# Interrupt Objects in pw_kernel

## Overview

`InterruptObject` delivers hardware interrupts to userspace. A single object can
multiplex up to **15 IRQ sources**, mapped to signal bits 16–30 (`INTERRUPT_A`
through `INTERRUPT_O`).

The interrupt stays **masked at the hardware controller** between the ISR firing
and userspace calling `interrupt_ack()`. This prevents interrupt storms while
userspace processes the event.

## End-to-End Interrupt Flow

```
HW IRQ fires
  → generated ISR wrapper (from interrupts.rs.jinja):
      1. InterruptController::userspace_interrupt_handler_enter(irq)  // masks IRQ
      2. interrupt_object.interrupt(kernel, mapped_signal)            // sets signal bit
      3. InterruptController::userspace_interrupt_handler_exit(irq)   // reschedule if needed
  → signal wakes any thread blocked in object_wait()
  → userspace services the interrupt
  → userspace calls interrupt_ack(handle, signals)
      1. clears signal bits on the object
      2. calls InterruptController::userspace_interrupt_ack(irq)      // unmasks HW IRQ
```

## Build-Time Configuration (Code Generation)

Interrupt objects are **statically allocated** at build time via Jinja templates
(`tooling/system_generator/templates/`):

- **`interrupts.rs.jinja`** — generates ISR wrappers and the interrupt table. Each
  IRQ gets a wrapper that calls `userspace_interrupt_handler_enter()`, signals the
  `InterruptObject`, and calls `userspace_interrupt_handler_exit()`.

- **`objects/interrupt.rs.jinja`** — generates per-object setup:
  - A signal-to-IRQ mapping table used by `ack_irqs()`
  - Static `InterruptObject::new(ack_irqs)` allocation
  - Enables all IRQs at the interrupt controller during init

### Generated `ack_irqs()` function

Maps signal bits back to hardware IRQ numbers:

```rust
fn ack_irqs(signal_mask: Signals) {
    let signal_mask_table: [u32; N] = [irq0, irq1, ...];
    for (index, irq) in signal_mask_table.iter().enumerate() {
        let interrupt_bit = 1 << (16 + index);
        if signal_mask.contains(Signals::from_bits_retain(interrupt_bit)) {
            InterruptController::userspace_interrupt_ack(*irq);
        }
    }
}
```

## Kernel Implementation

`InterruptObject` (`kernel/object/interrupt.rs`):

```rust
pub struct InterruptObject<K: Kernel> {
    base: ObjectBase<K>,
    ack_irqs: fn(Signals),       // generated ack function
}

impl InterruptObject {
    // Called from ISR context — sets signal bits on the object
    pub fn interrupt(&self, kernel: K, signal_mask: Signals) {
        self.base.signal(kernel, |_| signal_mask);
    }
}

impl KernelObject for InterruptObject {
    // Blocks until any of the requested interrupt signals are active
    fn object_wait(&self, kernel, signal_mask, deadline) -> Result<WaitReturn> { ... }

    // Clears signal bits and re-enables hardware IRQs
    fn interrupt_ack(&self, kernel: K, signal_mask: Signals) -> Result<()> {
        self.base.state.lock(kernel).active_signals -= signal_mask;
        (self.ack_irqs)(signal_mask);
        Ok(())
    }
}
```

## InterruptController Trait

`kernel/interrupt_controller.rs` abstracts the hardware interrupt controller
(ARM NVIC, RISC-V PLIC, VeerEL2 PIC):

| Method | Purpose |
|--------|---------|
| `enable_interrupt(irq)` | Enable a specific IRQ |
| `disable_interrupt(irq)` | Disable a specific IRQ |
| `userspace_interrupt_handler_enter(irq)` | Mask IRQ before signaling object (ISR context) |
| `userspace_interrupt_handler_exit(irq)` | Complete ISR, reschedule if needed |
| `userspace_interrupt_ack(irq)` | Unmask IRQ after userspace acknowledges |
| `kernel_interrupt_handler_enter(irq)` | Kernel-driver ISR enter |
| `kernel_interrupt_handler_exit(irq)` | Kernel-driver ISR exit |

## Userspace Usage Pattern

From the UART test (`tests/uart/user/uart_listener.rs`):

```rust
#[entry]
fn entry() -> ! {
    let mut uart = Uart::new(mapping::UART0_START_ADDRESS);

    loop {
        // 1. Block until UART interrupt signal fires
        let wait_return = syscall::object_wait(
            handle::UART_INTERRUPTS,
            signals::UART0,
            Instant::MAX,
        ).unwrap();

        // 2. Service the interrupt
        let value = uart.read().unwrap();

        // 3. Acknowledge — clears signal bits AND re-enables HW IRQ
        syscall::interrupt_ack(
            handle::UART_INTERRUPTS,
            wait_return.pending_signals,
        );
    }
}
```

### Key points in the usage pattern

1. **`object_wait()`** blocks until the requested interrupt signal(s) become active.
2. The returned `pending_signals` tells which interrupt(s) fired (multiple can fire
   between waits).
3. **`interrupt_ack()`** must be called after servicing — it both clears the signal
   bits on the object and unmasks the hardware IRQ at the controller.
4. Until `interrupt_ack()` is called, the hardware IRQ stays masked, preventing
   re-entry.

## Syscalls

| Syscall | Purpose |
|---------|---------|
| `object_wait(handle, signal_mask, deadline)` | Block until interrupt signals match |
| `interrupt_ack(handle, signal_mask)` | Clear signals and re-enable hardware IRQs |

## Open Questions

- **Multi-threaded wait semantics**: What happens if multiple threads wait on the
  same interrupt object simultaneously? (Noted as open in `syscall_defs.rs`.)
