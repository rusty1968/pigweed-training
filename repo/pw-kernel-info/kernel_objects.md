# Signals in pw_kernel

## Kernel Objects

All kernel objects are referenced from userspace via `u32` handles into a per-process
`ObjectTable`. Every object embeds an `ObjectBase` that provides the common signal and
wait infrastructure.

### Channel (Initiator + Handler)

A **channel** is a unidirectional IPC connection between two asymmetric peers.

- **`ChannelInitiatorObject`** — the requesting side. Sends a request buffer and blocks
  (or uses async) until the handler responds. Zero-copy: the kernel copies directly between
  the peers' buffers during syscalls.
- **`ChannelHandlerObject`** — the serving side. Reads the request with `channel_read()`
  (which can be called multiple times) and replies with `channel_respond()`.

| Syscall | Side | Purpose |
|---------|------|---------|
| `channel_transact()` | Initiator | Send request + block for response |
| `channel_async_transact()` | Initiator | Send request (non-blocking) |
| `channel_async_cancel()` | Initiator | Cancel pending async transaction |
| `channel_read()` | Handler | Read request data (kernel copies from initiator buffer) |
| `channel_respond()` | Handler | Send response (kernel copies to initiator buffer) |
| `object_raise_peer_user_signal()` | Either | Set `USER` signal on the peer |

**Initiator signals**: `WRITEABLE` (idle, can transact), `READABLE` (response ready),
`ERROR` (transaction error), `USER` (handler raised out-of-band signal).

**Handler signals**: `READABLE`/`WRITEABLE` (transaction pending), `ERROR`,
`USER` (initiator raised out-of-band signal).

### Wait Group (`WaitGroupObject`)

Multiplexes waiting across multiple objects. Members are added/removed dynamically.
An object may only belong to **one** wait group at a time (enabled by intrusive list
storage in `ObjectBase`).

| Syscall | Purpose |
|---------|---------|
| `wait_group_add()` | Add object with signal mask and `user_data` |
| `wait_group_remove()` | Remove object from group |
| `object_wait()` | Block until any member is signaled; returns member's `user_data` |

### Interrupt (`InterruptObject`)

Delivers hardware interrupts to userspace. A single object can multiplex up to **15 IRQ
sources** (signal bits 16–30: `INTERRUPT_A` through `INTERRUPT_O`).

When an IRQ fires, the kernel **masks** the interrupt at the controller and sets the
corresponding signal bit. After userspace services the interrupt, it calls
`interrupt_ack()` to clear signals and **re-enable** the hardware IRQ.

| Syscall | Purpose |
|---------|---------|
| `object_wait()` | Block until interrupt signals fire |
| `interrupt_ack()` | Clear signal bits and re-enable hardware IRQs |

### Futex (In Design)

Mentioned in the syscall documentation as planned but not yet implemented.

### Common Syscalls (All Objects)

| Syscall | Purpose |
|---------|---------|
| `object_wait()` | Block until signals match a mask (or deadline expires) |
| `object_raise_peer_user_signal()` | Set `USER` signal on a channel peer |

---

## What Are Signals?

Signals are a **32-bit bitflag** (defined in `syscall_defs.rs`) representing pending
conditions on kernel objects. Multiple signals can be active simultaneously on any object.

### Standard Signal Bits

| Bits  | Signal                       | Meaning                                    |
|-------|------------------------------|--------------------------------------------|
| 0     | `READABLE`                   | Object has data to read                    |
| 1     | `WRITEABLE`                  | Object can accept writes                   |
| 2     | `ERROR`                      | Object is in an error state                |
| 15    | `USER`                       | User-defined out-of-band signal            |
| 16–30 | `INTERRUPT_A`–`INTERRUPT_O`  | Up to 15 hardware interrupts per object    |
| 31    | `RESERVED`                   | Internal kernel use                        |

## Core Data Structures

Every kernel object has an **`ObjectBase`** (in `object.rs`) containing:

- **`active_signals: Signals`** — the currently pending signal bits
- **`waiters`** — an intrusive list of `ObjectWaiter`s (threads blocked on this object)
- **`wait_group`** — optional membership in a wait group

Each **`ObjectWaiter`** holds:

- A **`signal_mask`** — which signals this particular waiter cares about
- An **`EventSignaler`** — a bridge to the scheduler's wait queue, used to unblock the
  waiting thread
- A **`WaitResult`** — carries back the pending signals when the wait completes

## Blocking on Signals: `object_wait()`

The primary syscall for consuming signals:

```rust
syscall::object_wait(handle, signal_mask, deadline) -> Result<WaitReturn>
```

The flow:

1. The thread creates an `Event` and an `ObjectWaiter` with the desired `signal_mask`.
2. The waiter is pushed onto the object's waiter list.
3. The object's spinlock is **released** (critical to avoid deadlocks).
4. The thread blocks on the `Event`, which puts it to sleep in the scheduler's wait queue.
5. On wakeup, it reacquires the lock, removes itself from the waiter list, and returns
   the `WaitReturn` (containing `pending_signals` and `user_data`).

If the requested signals are **already active** when `object_wait()` is called, it returns
immediately without blocking.

## Generating Signals

Signals are set from various sources:

- **Channels**: `channel_transact()` sets `READABLE` on the handler side;
  `channel_respond()` sets `READABLE` on the initiator side.
  `object_raise_peer_user_signal()` sets the `USER` signal on the peer.
- **Interrupt objects**: Hardware IRQs set interrupt signal bits. After handling, userspace
  calls `interrupt_ack()` to clear signals and re-enable the hardware interrupt.
- **Internal API**: Any object can call `signal()` with a closure to update
  `active_signals`.

## Wakeup Flow

When signals are set on an object, `signal_impl()` runs:

1. If the object is a **wait group member**, it notifies the parent wait group.
2. It iterates the object's **waiter list** and for each waiter whose `signal_mask`
   **intersects** the new `active_signals`, it calls `EventSignaler::signal()` — which
   wakes the blocked thread via the scheduler.

```
Syscall / HW IRQ
  → signal bits set on object (under spinlock)
    → signal_impl() iterates waiters
      → matching waiter's EventSignaler::signal()
        → scheduler unblocks the thread
          → thread returns from object_wait() with WaitReturn
```

## Wait Groups (Multiplexed Waiting)

Wait groups let a thread wait on **multiple objects** at once:

```rust
wait_group_add(wg_handle, obj_handle, signal_mask, user_data)
wait_group_remove(wg_handle, obj_handle)
// Then:
object_wait(wg_handle, READABLE, deadline) -> WaitReturn { user_data, ... }
```

Internally, a wait group keeps two lists: **signaled members** and **unsignaled members**.
When any member object's signals fire, the member moves to the signaled list, and the wait
group itself becomes `READABLE`. The returned `user_data` identifies *which* member was
signaled, enabling demultiplexing.

## Channel Signal Lifecycle (Example)

```
Initiator                           Handler
─────────                           ───────
channel_transact()
  → clears own READABLE/WRITEABLE
  → sets handler's READABLE        handler's object_wait() returns
                                    handler processes request
                                    channel_respond()
                                      → clears own READABLE/WRITEABLE
initiator's wait returns              → sets initiator's READABLE
  (with response data)
```

## Key Design Points

- **Bitflag model**: Signals are level-triggered (persistent), not edge-triggered. They
  remain active until explicitly cleared.
- **Spinlock + Event bridge**: Object state is guarded by a spinlock, but blocking goes
  through the scheduler's `Event` mechanism — the spinlock is released *before* the thread
  sleeps.
- **ISR safety**: `EventSignaler::signal()` can be called from interrupt context, making
  hardware interrupt delivery to userspace straightforward.
- **All-matching wakeup**: When signals change, *all* waiters with a matching mask are
  woken (not just one), enabling broadcast-style notifications.
