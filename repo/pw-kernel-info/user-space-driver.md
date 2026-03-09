# Training Track: Building a Userspace Driver on pw_kernel

A step-by-step guide that walks through every artifact needed to create
a userspace peripheral driver on Pigweed's Rust kernel—using the
**I2C service** (`services/i2c`) as the running example.

---

## Prerequisites

| What | Why |
|------|-----|
| Embedded Rust (`#![no_std]`, `#![no_main]`) | All service code runs without the standard library |
| Bazel basics (`load`, `deps`, `visibility`) | The build graph wires everything together |
| I2C protocol fundamentals (START, address byte, ACK/NAK) | Needed to understand what the driver does, not just how it's structured |

---

## Road Map

```
Module 1  Orientation — how a pw_kernel service is structured
Module 2  Step 1: Define the wire protocol  (api/src/wire.rs)
Module 3  Step 2: Define client types       (api/src/{address,error,client,operation}.rs)
Module 4  Step 3: Implement the backend     (backend-aspeed/src/lib.rs)
Module 5  Step 4: Write the server loop     (server/src/main.rs)
Module 6  Step 5: Write the IPC client      (client/src/lib.rs)
Module 7  Step 6: Wire up system.json5      (target/ast1060-evb/i2c/system.json5)
Module 8  Step 7: Bazel build graph         (BUILD.bazel files)
Module 9  Step 8: Write integration tests   (i2c_client_test.rs)
Module 10 Exercises — extend the service
```

Each module has: **Goal → Key Concepts → Code Walkthrough → Check Your
Understanding**.

---

## Module 1 — Orientation

### Goal

Understand the five crates that make up a userspace driver and how they
relate at runtime.

### The Five Crates (3 Libraries + 2 Binaries)

```
┌──────────────────┐   IPC    ┌─────────────────┐
│ i2c_client_test   │────────►│  i2c_server      │
│ (binary — app)    │◄────────│  (binary — app)  │
└────────┬─────────┘          └────────┬─────────┘
         │ uses                        │ uses
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│  i2c_client       │          │ i2c_backend_     │
│  (library)        │          │ aspeed (library)  │
└────────┬─────────┘          └────────┬─────────┘
         │ uses                        │ wraps
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│  i2c_api          │          │  aspeed-ddk      │
│  (library)        │◄─────────│  Ast1060I2c      │
└──────────────────┘          └──────────────────┘
        ▲                              
        └──── i2c_server also depends on i2c_api
```

Both processes are `rust_binary` targets that run as isolated userspace
apps.  The client binary (`i2c_client_test` here, but any app that calls
`IpcI2cClient`) links the client library; the server binary links the
backend library.  Both depend on `i2c_api`.

| Crate | Kind | Depends on kernel? | Purpose |
|-------|------|--------------------|---------|
| `i2c_api` | `rust_library` | **No** | Types, traits, wire format shared by client and server |
| `i2c_client` | `rust_library` | Yes (userspace syscalls) | Translates method calls into IPC round-trips |
| `i2c_backend_aspeed` | `rust_library` | No (only PAC + DDK) | Translates server requests into MMIO register accesses |
| `i2c_server` | `rust_binary` | Yes (userspace syscalls) | Dispatch loop: receive IPC → call backend → respond |
| `i2c_client_test` | `rust_binary` | Yes | Integration test exercising the full IPC stack |

### Key Principle

The **API crate has zero kernel dependencies**.  It compiles and tests on
the host (`rust_test`).  This means you can iterate on your wire protocol
and data types without touching firmware.

### Check Your Understanding

1. Which crate would you change to add a new operation (e.g., `SetPullup`)?
2. Which crate would you change to port the service to a different SoC?
3. Can you run `bazel test //services/i2c/api:i2c_api_test` without a
   target board?

<details>
<summary>Answers</summary>

1. `i2c_api` (add opcode + encoding) and `i2c_server` (add dispatch branch)
   and `i2c_backend_aspeed` (add hardware call).
2. Only `i2c_backend_aspeed` — replace with `i2c_backend_newchip`.
3. Yes — it has no kernel dependency and runs on the host.

</details>

---

## Module 2 — Define the Wire Protocol

### Goal

Design the byte-level format that crosses the IPC channel between client
and server.

### Key File: `services/i2c/api/src/wire.rs`

### Concepts

The pw_kernel IPC channel transfers flat byte buffers.  Client and server
must agree on a header layout:

```
Request (8 bytes + payload):
┌──────┬─────┬──────┬─────┬──────────┬──────────┐
│ op:1 │bus:1│addr:1│rsv:1│write_len:2│read_len:2│
└──────┴─────┴──────┴─────┴──────────┴──────────┘
  + [write_len bytes of write data]

Response (4 bytes + payload):
┌──────┬─────┬──────────┐
│code:1│rsv:1│data_len:2│
└──────┴─────┴──────────┘
  + [data_len bytes of read data]
```

### Walkthrough

**1. Operation codes** — a `repr(u8)` enum with a `from_u8` constructor:

```rust
#[repr(u8)]
pub enum I2cOp {
    Write     = 0,
    Read      = 1,
    WriteRead = 2,
    Transaction = 3,
    Probe     = 4,
    ConfigureSpeed = 5,
    RecoverBus = 6,
}
```

**2. Request header** — plain struct with manual `to_bytes` / `from_bytes`:

```rust
pub struct I2cRequestHeader {
    pub op: u8,
    pub bus: u8,
    pub address: u8,
    pub write_len: u16,
    pub read_len: u16,
}

impl I2cRequestHeader {
    pub const SIZE: usize = 8;

    pub fn to_bytes(&self) -> [u8; Self::SIZE] {
        let write_le = self.write_len.to_le_bytes();
        let read_le  = self.read_len.to_le_bytes();
        [self.op, self.bus, self.address, 0,
         write_le[0], write_le[1], read_le[0], read_le[1]]
    }

    pub fn from_bytes(bytes: &[u8]) -> Option<Self> { /* ... */ }
}
```

**3. Encoding helpers** — one function per operation, each returning
`Result<usize, WireError>` (bytes written).  This pattern prevents the
caller from miscomputing offsets:

```rust
pub fn encode_write_request(
    buf: &mut [u8], bus: u8, address: u8, data: &[u8]
) -> Result<usize, WireError> {
    //  validate → fill header → copy payload → return total length
}
```

**4. Response header + data extraction** — similar pattern for the server
side.

### Design Rules

| Rule | Rationale |
|------|-----------|
| Fixed-size headers, variable payload | No allocation; parse with `from_bytes` on a stack buffer |
| Little-endian multi-byte fields | ARM is LE; avoids byte-swap on target |
| `MAX_PAYLOAD_SIZE = 256` | Fits comfortably in pw_kernel's channel buffer |
| One error type for the wire layer (`WireError`) | Separate from hardware errors and IPC errors |

### Check Your Understanding

1. Why does the request header reserve a byte that is always zero?
2. What happens if a client sends a 9-byte buffer (header + 1 byte) for a
   `Read` operation?
3. Could you use `zerocopy` instead of manual `to_bytes`/`from_bytes`?

<details>
<summary>Answers</summary>

1. Alignment padding.  Keeps `write_len` at offset 4 (natural u16 alignment).
   Also leaves room for future flags.
2. The server parses the header, sees `read_len > 0`, reads from hardware
   into its response buffer, responds with data.  The 1 extra byte in the
   payload is ignored because `write_len == 0`.
3. Yes — the crypto service does exactly that.  The I2C service uses manual
   encoding to avoid the zerocopy dependency, which is a valid trade-off for
   a smaller API crate.

</details>

---

## Module 3 — Define Client Types

### Goal

Build the type-safe vocabulary that applications program against.

### Key Files

| File | What it contributes |
|------|---------------------|
| `api/src/address.rs` | `I2cAddress` — validated 7-bit address newtype |
| `api/src/error.rs` | `ResponseCode`, `I2cError`, `I2cErrorKind` |
| `api/src/operation.rs` | `Operation::Write` / `Operation::Read` for transactions |
| `api/src/client.rs` | `I2cClient` trait, `I2cClientBlocking` blanket impl |
| `api/src/target.rs` | `I2cTargetClient` trait for slave mode |

### Walkthrough

**1. `I2cAddress` — reject bad addresses at construction time:**

```rust
pub const fn new(addr: u8) -> Result<Self, AddressError> {
    if addr > 0x7F { return Err(AddressError::OutOfRange(addr)); }
    if addr <= 0x07 || addr >= 0x78 { return Err(AddressError::Reserved(addr)); }
    Ok(I2cAddress(addr))
}
```

Once you have an `I2cAddress`, every downstream function can assume it's
valid.  No runtime re-checking needed.

**2. `ResponseCode` — one enum for every possible server response:**

```rust
#[repr(u8)]
pub enum ResponseCode {
    Success        = 0,
    NoDevice       = 1,
    NackData       = 2,
    ArbitrationLost= 3,
    BusStuck       = 4,
    Timeout        = 5,
    InvalidBus     = 6,
    // ... 15 variants total
}
```

This is the *wire-level* error.  The client wraps it in `I2cError`, which
adds `I2cErrorKind` (compatible with `embedded_hal::i2c::ErrorKind`):

```rust
pub struct I2cError {
    pub code: ResponseCode,             // wire value
    pub kind: Option<I2cErrorKind>,     // embedded-hal mapping
}
```

**3. `I2cClient` trait — the service contract:**

```rust
pub trait I2cClient: ErrorType {
    fn write_read(
        &mut self, bus: BusIndex, address: I2cAddress,
        write: &[u8], read: &mut [u8],
    ) -> Result<usize, Self::Error>;

    fn transaction(
        &mut self, bus: BusIndex, address: I2cAddress,
        operations: &mut [Operation<'_>],
    ) -> Result<(), Self::Error>;
}
```

High-level convenience methods (`write`, `read`, `probe`, `read_register`,
`write_register`) are provided by a **blanket impl** on `I2cClientBlocking`,
so every `I2cClient` implementor gets them for free.

### Design Pattern: Separate Traits from Transport

`I2cClient` says *what* operations exist.  It says nothing about IPC,
channels, or syscalls.  You could implement it with a mock for unit tests,
with a USB-to-I2C bridge for host-side tooling, or with direct register
access for a monolithic firmware.

### Check Your Understanding

1. Why is `I2cClient::write_read` the fundamental method, rather than
   separate `write` and `read`?
2. What does the `ErrorType` supertrait buy us?
3. How does `probe` work without a dedicated `Probe` operation at the
   trait level?

<details>
<summary>Answers</summary>

1. Because `write_read` with an empty write buffer *is* a read, and with an
   empty read buffer *is* a write.  One method covers three wire operations
   (Write, Read, WriteRead).
2. It lets generic code refer to `C::Error` and use `?` without needing a
   concrete error type.  It also makes the trait compatible with
   embedded-hal's `I2c` trait.
3. `probe` calls `write(bus, addr, &[])` (zero-length write) — if the
   device ACKs, it returns `Ok(true)`.  If it NACKs, `probe` checks
   the error kind and returns `Ok(false)`.

</details>

---

## Module 4 — Implement the Backend

### Goal

Connect the server's abstract dispatch to real hardware registers.

### Key File: `services/i2c/backend-aspeed/src/lib.rs`

### Concepts

The backend wraps `aspeed-ddk::i2c_core::Ast1060I2c`.  It owns the PAC
peripherals exclusively and maps hardware errors to `ResponseCode` values.

### Two-Layer Initialization

| Layer | What | When | Code |
|-------|------|------|------|
| **Platform** | SCU reset release, I2CG global regs, pin mux | Kernel boot (`entry.rs`) | `init_i2c_global()`, `apply_pinctrl_group()` |
| **Per-bus** | I2CC00 controller-local reset, timing, IRQ enable | Server startup | `backend.init_bus(0)` |

This split exists because SCU registers are shared across all I2C
controllers and must be written before processes launch.

### Per-Operation Fast Path

```rust
pub fn write(&mut self, bus: u8, addr: u8, data: &[u8]) -> Result<(), ResponseCode> {
    if !self.is_bus_initialized(bus) {
        return Err(ResponseCode::ServerError);
    }
    let (regs, buffs) = self.controller_regs(bus)?;
    let ctrl = I2cController { controller: DdkController(bus), registers: regs, ... };
    // from_initialized(): NO register writes — re-uses init from init_bus()
    let mut i2c = Ast1060I2c::from_initialized(&ctrl, I2cConfig::default());
    i2c.write(addr, data).map_err(map_i2c_error)
}
```

`from_initialized()` creates a transient handle on the **stack** with
zero register writes.  This is ~50× faster than calling `Ast1060I2c::new()`
per operation (which Hubris did).

### Error Mapping

A single function translates hardware errors to wire codes:

```rust
fn map_i2c_error(e: I2cError) -> ResponseCode {
    match e {
        I2cError::NoAcknowledge      => ResponseCode::NoDevice,
        I2cError::ArbitrationLoss    => ResponseCode::ArbitrationLost,
        I2cError::Timeout            => ResponseCode::Timeout,
        I2cError::Busy               => ResponseCode::Busy,
        I2cError::InvalidAddress     => ResponseCode::InvalidAddress,
        I2cError::BusRecoveryFailed  => ResponseCode::BusStuck,
        I2cError::Bus | I2cError::Overrun | I2cError::Abnormal
        | I2cError::SlaveError       => ResponseCode::IoError,
        I2cError::Invalid            => ResponseCode::ServerError,
    }
}
```

### Check Your Understanding

1. Why does `AspeedI2cBackend::new()` require `unsafe`?
2. What would break if you removed the `is_bus_initialized` check?
3. How would you add a second SoC backend (e.g., for STM32)?

<details>
<summary>Answers</summary>

1. It calls `Peripherals::steal()`, which creates a PAC handle without
   taking ownership.  The caller must guarantee exclusive access.
2. `from_initialized()` would operate on uninitialized controller registers,
   producing undefined hardware behavior.
3. Create `services/i2c/backend-stm32/` with a `Stm32I2cBackend` that
   wraps the STM32 HAL.  Change the server's `BUILD.bazel` deps to point
   at the new backend.  Nothing else changes.

</details>

---

## Module 5 — Write the Server Loop

### Goal

Build the dispatch loop that receives IPC requests, calls the backend,
and responds.

### Key File: `services/i2c/server/src/main.rs`

### The Pattern

Every pw_kernel userspace server follows the same three-syscall loop:

```rust
loop {
    // 1. Block until client sends a request
    syscall::object_wait(handle::I2C, Signals::READABLE, Instant::MAX)?;

    // 2. Copy the request into server RAM
    let len = syscall::channel_read(handle::I2C, 0, &mut request_buf)?;

    // 3. Dispatch and respond
    let response_len = dispatch_i2c_op(&request_buf[..len], &mut response_buf, &mut backend);
    syscall::channel_respond(handle::I2C, &response_buf[..response_len])?;
}
```

### Dispatch

```rust
fn dispatch_i2c_op(request: &[u8], response: &mut [u8], backend: &mut AspeedI2cBackend) -> usize {
    let header = I2cRequestHeader::from_bytes(request)?;
    let op     = header.operation()?;
    let payload = &request[I2cRequestHeader::SIZE..];

    match op {
        I2cOp::Write     => { /* extract write_len bytes → backend.write() */ }
        I2cOp::Read      => { /* backend.read() into response buffer directly */ }
        I2cOp::WriteRead => { /* backend.write_read() with repeated START */ }
        I2cOp::Probe     => { /* backend.write(bus, addr, &[]) */ }
        I2cOp::RecoverBus=> { /* backend.recover_bus() */ }
        _                => { encode_error(response, ResponseCode::ServerError) }
    }
}
```

### Zero-Copy Read Path

For `Read` and `WriteRead`, the server reads hardware data **directly into
the response buffer** at offset `I2cResponseHeader::SIZE`:

```rust
I2cOp::Read => {
    let rlen = header.read_len as usize;
    let read_buf = &mut response[I2cResponseHeader::SIZE..I2cResponseHeader::SIZE + rlen];
    backend.read(header.bus, header.address, read_buf)?;
    encode_success(response, rlen)  // writes header before the data already in place
}
```

No intermediate buffer, no copy.

### Entry Point

```rust
#[entry]   // pw_kernel userspace entry macro
fn entry() -> ! {
    if let Err(e) = i2c_server_loop() {
        pw_log::error!("I2C server error: {}", e as u32);
        let _ = syscall::debug_shutdown(Err(e));
    }
    loop {}
}
```

### Check Your Understanding

1. What happens if two clients send requests simultaneously?
2. Why is `Instant::MAX` used in `object_wait`?
3. Could the server handle multiple buses in parallel?

<details>
<summary>Answers</summary>

1. The kernel serializes channel access: one client blocks until the server
   responds to the first.  The server is single-threaded.
2. It means "wait forever" — the server has no timeout, it just blocks
   until work arrives.
3. Not in this design (single thread, single dispatch loop).  You'd need
   either multiple threads with separate channels or an async reactor.

</details>

---

## Module 6 — Write the IPC Client

### Goal

Provide an ergonomic API that hides the IPC mechanics.

### Key File: `services/i2c/client/src/lib.rs`

### The Client Struct

```rust
pub struct IpcI2cClient {
    handle: u32,                             // IPC channel handle
    request_buf: [u8; MAX_REQUEST_SIZE],     // stack-allocated encode buffer
    response_buf: [u8; MAX_RESPONSE_SIZE],   // stack-allocated decode buffer
}
```

### Implementing `I2cClient`

The client implements the trait from the API crate:

```rust
impl I2cClient for IpcI2cClient {
    fn write_read(&mut self, bus: BusIndex, address: I2cAddress,
                  write: &[u8], read: &mut [u8]) -> Result<usize, I2cError>
    {
        // Decide which wire operation to use
        if write.is_empty() && read.is_empty() {
            // → Probe
            let req_len = encode_probe_request(&mut self.request_buf, bus.value(), address.value())?;
            let resp_len = self.send_recv(req_len)?;
            self.decode_response(resp_len)?;
            Ok(0)
        } else if write.is_empty() {
            // → Read
            let req_len = encode_read_request(&mut self.request_buf, bus.value(), address.value(), read.len() as u16)?;
            let resp_len = self.send_recv(req_len)?;
            let data = self.decode_response(resp_len)?;
            read[..data.len()].copy_from_slice(data);
            Ok(data.len())
        } else if read.is_empty() {
            // → Write
            // ...
        } else {
            // → WriteRead
            // ...
        }
    }
}
```

### The IPC Round-Trip

```rust
fn send_recv(&mut self, req_len: usize) -> Result<usize, I2cError> {
    syscall::channel_transact(
        self.handle,
        &self.request_buf[..req_len],
        &mut self.response_buf,
        Instant::MAX,          // blocking call
    )
    .map_err(|_| I2cError::from_code(ResponseCode::ServerError))
}
```

`channel_transact` = send request + block + receive response, all in one
syscall.  This is the client-side counterpart to the server's
`object_wait` + `channel_read` + `channel_respond` triple.

### Error Translation

The client translates two error domains:

```
WireError (encode/decode failure) ──► I2cError
ResponseCode (server-side error)  ──► I2cError with I2cErrorKind (embedded-hal)
```

This makes the client's errors compatible with the embedded-hal ecosystem.

### Check Your Understanding

1. Why does the client own its encode/decode buffers instead of taking them
   as parameters?
2. What does the caller see if the I2C device NACKs the address byte?
3. Could you write a mock `I2cClient` implementation for unit tests?

<details>
<summary>Answers</summary>

1. Convenience — callers don't need to manage buffer lifetimes.  The buffers
   are 264 bytes each, fitting on the stack.
2. The server returns `ResponseCode::NoDevice`, the client maps it to
   `I2cError { code: NoDevice, kind: Some(NoAcknowledge(Address)) }`.
   Code using embedded-hal's `Error` trait sees `ErrorKind::NoAcknowledge`.
3. Yes — implement `I2cClient` on a struct that records calls and returns
   canned responses.  The trait has no kernel dependencies.

</details>

---

## Module 7 — Wire Up `system.json5`

### Goal

Declare the processes, memory, channels, and threads that the kernel will
create at boot.

### Key File: `target/ast1060-evb/i2c/system.json5`

### The Configuration

```json5
{
    arch: { type: "armv7m", vector_table_start_address: 0x00000000, ... },
    kernel: {
        flash_start_address: 0x000004A0,
        flash_size_bytes: 129888,       // ~126 KB
        ram_start_address: 0x00060000,
        ram_size_bytes: 131072,         // 128 KB
    },
    apps: [
        {
            name: "i2c_server",
            flash_size_bytes: 131072,   // 128 KB
            ram_size_bytes: 65536,      // 64 KB
            process: {
                name: "i2c server process",
                objects: [{
                    name: "I2C",
                    type: "channel_handler",    // ← server side
                }],
                threads: [{
                    name: "i2c server thread",
                    stack_size_bytes: 4096,
                }],
            },
        },
        {
            name: "i2c_client",
            flash_size_bytes: 131072,
            ram_size_bytes: 65536,
            process: {
                name: "i2c client process",
                objects: [{
                    name: "I2C",
                    type: "channel_initiator",  // ← client side
                    handler_app: "i2c_server",
                    handler_object_name: "I2C",
                }],
                threads: [{
                    name: "i2c client thread",
                    stack_size_bytes: 2048,
                }],
            },
        },
    ],
}
```

### What the Kernel Does with This

1. **Memory** — Creates MPU regions per app (flash + RAM), so neither process
   can touch the other's memory.
2. **Channels** — Allocates a kernel channel object.  The client's
   `channel_initiator` is wired to the server's `channel_handler` by
   matching `handler_app` + `handler_object_name`.
3. **Handles** — `target_codegen` + `app_package` generate Rust constants:
   `app_i2c_server::handle::I2C` and `app_i2c_client::handle::I2C`.
4. **Threads** — Each process gets a thread with the declared stack size.
   The kernel starts both threads; whichever runs first blocks on its
   first `object_wait` or `channel_transact`.

### Sizing Guidelines

| Resource | How to size |
|----------|-------------|
| Server flash | Compile the server binary, round up to next power of 2 |
| Server RAM | MMIO buffer size + stack + worst-case DMA descriptors |
| Client flash | Application code + client library |
| Client RAM | Stack + request/response buffers (256 + 260 bytes for I2C) |
| Stack | Profile with overflow detection; 4 KB is conservative for I2C |

### Check Your Understanding

1. What prevents the client from forging a handle to another server?
2. What happens if you change `handler_object_name` to a name that doesn't
   match any server object?
3. Why does the server get 64 KB RAM while the client gets 64 KB too?

<details>
<summary>Answers</summary>

1. Handles are indices into a per-process object table populated by the
   kernel from `system.json5`.  A process can only reference its own table.
2. Code generation fails — `target_codegen` validates that every
   `channel_initiator` resolves to an existing `channel_handler`.
3. The server needs room for MMIO-mapped register blocks and hardware
   buffers; the client needs room for its test logic.  They happen to
   get the same size here, but typically the server gets more.

</details>

---

## Module 8 — The Bazel Build Graph

### Goal

Understand how `BUILD.bazel` files turn five crates + one `system.json5`
into a flashable image.

### Dependency Tree

```
target/ast1060-evb/i2c:i2c              (system_image)
├── :target                              (rust_binary — kernel)
│   ├── :codegen                         (target_codegen ← system.json5)
│   ├── :linker_script                   (target_linker_script ← system.json5)
│   └── @pigweed//pw_kernel/...
├── //services/i2c/server:i2c_server     (rust_binary — app)
│   ├── :app_i2c_server                  (app_package ← system.json5)
│   ├── //services/i2c/api:i2c_api
│   └── //services/i2c/backend-aspeed:i2c_backend_aspeed
│       ├── @oot_crates_no_std//:aspeed-ddk
│       └── @oot_crates_no_std//:ast1060-pac
└── :i2c_client_test                     (rust_binary — app)
    ├── :app_i2c_client                  (app_package ← system.json5)
    ├── //services/i2c/api:i2c_api
    └── //services/i2c/client:i2c_client
```

### Key Rules

**`system_image`** — combines kernel + apps into one ELF:

```starlark
system_image(
    name = "i2c",
    apps = [":i2c_client_test", "//services/i2c/server:i2c_server"],
    kernel = ":target",
    platform = "//target/ast1060-evb",
    system_config = ":system_config",
)
```

**`app_package`** — generates the `handle` module from `system.json5`:

```starlark
app_package(
    name = "app_i2c_server",
    app_name = "i2c_server",          # must match system.json5 apps[].name
    system_config = ":system_config",
)
```

**`system_image_test`** — runs the image on target and checks exit code:

```starlark
system_image_test(
    name = "i2c_test",
    image = ":i2c",
)
```

### Build Commands

```bash
# Build the full system image
bazel build --config=k_ast1060_evb //target/ast1060-evb/i2c:i2c

# Run tests on EVB via UART
bazel test --config=k_ast1060_evb //target/ast1060-evb/i2c:i2c_test --test_output=all

# Run on physical board via UART (explicit device)
bazel test :i2c_uart_test --test_env=UART_DEVICE=/dev/ttyUSB0
```

### Check Your Understanding

1. Where does `app_i2c_server::handle::I2C` come from?
2. What Bazel rule must you add if you create a new service app?
3. Why is `i2c_api` the only crate with `rust_test`?

<details>
<summary>Answers</summary>

1. Generated by `app_package` from `system.json5` — the server's first
   object is named `"I2C"`, so it gets constant index 0.
2. An `app_package` rule for the new app, and add it to the
   `system_image.apps` list.
3. It's the only crate with no kernel/target dependencies, so it can
   run `cargo test` / `bazel test` natively.

</details>

---

## Module 9 — Write Integration Tests

### Goal

Exercise the full IPC stack end-to-end on real hardware.

### Key File: `target/ast1060-evb/i2c/i2c_client_test.rs`

### Structure

The test binary is a userspace process that uses `IpcI2cClient` exactly
like any application would:

```rust
fn run_i2c_tests() -> Result<()> {
    let mut client = IpcI2cClient::new(handle::I2C);
    let mut results = TestResults::new();

    test_probe_adt7490(&mut client, &mut results);       // device present?
    test_register_reads(&mut client, &mut results);      // read known registers
    test_write_read_device_id(&mut client, &mut results); // combined op
    test_probe_vacant(&mut client, &mut results);         // NAK expected

    if results.failed > 0 { Err(Error::Unknown) } else { Ok(()) }
}
```

### Test Patterns

| Test | What it exercises | Expected result |
|------|-------------------|-----------------|
| `test_probe_adt7490` | Zero-length write → ACK | `Ok(true)` |
| `test_register_reads` | Separate write (set pointer) + read | Known POR defaults |
| `test_write_read_device_id` | `write_read` combined operation | Device ID byte |
| `test_probe_vacant` | Zero-length write → NAK | `Ok(false)` |

### Reporting

Tests log via `pw_log::info!` / `pw_log::error!` and call
`syscall::debug_shutdown(Ok(()))` or `syscall::debug_shutdown(Err(e))`
to report pass/fail.  The `system_image_test` rule interprets the
exit code.

### Check Your Understanding

1. Why is the test binary a separate process, not code inside the server?
2. How does the test know that 0x2E is the ADT7490 address?
3. What would you add to test error paths (e.g., invalid bus)?

<details>
<summary>Answers</summary>

1. To exercise the full IPC path.  If the test were in the server, it would
   bypass the client library and channel serialization.
2. It's hardcoded from the EVB schematic.  Board-specific tests belong in
   `target/`, not in `services/`.
3. Call `client.write(BusIndex::new(99), ...)` and assert it returns
   `ResponseCode::InvalidBus`.

</details>

---

## Module 10 — Exercises

### Exercise 1: Add `ConfigureSpeed`

**Goal:** Let clients change the I2C clock frequency at runtime.

Steps:
1. Add a `ConfigureSpeed` variant to the request header (it's already in
   `I2cOp` as opcode 5).
2. Define how the speed parameter is encoded in the payload (e.g., a u32
   in Hz).
3. Add `encode_configure_speed_request` / `decode` to `wire.rs`.
4. Add a `configure_speed(bus, hz)` method to `AspeedI2cBackend`.
5. Add the dispatch branch in `server/src/main.rs`.
6. Add a client method in `IpcI2cClient` or the `I2cClient` trait.
7. Add a test.

### Exercise 2: Port to a New SoC

**Goal:** Create `backend-stm32/` for an STM32 chip.

Steps:
1. Create `services/i2c/backend-stm32/BUILD.bazel` and `src/lib.rs`.
2. Define `Stm32I2cBackend` wrapping the STM32 HAL I2C driver.
3. Implement the same methods: `write`, `read`, `write_read`, `recover_bus`.
4. Map the HAL's error type to `ResponseCode`.
5. Change `server/BUILD.bazel` deps to point at the new backend.
6. Write a new `system.json5` for the STM32 target.

Everything else — API, client, wire protocol, test structure — stays the
same.

### Exercise 3: Add Target Mode (I2C Slave)

**Goal:** Let the server respond to incoming I2C transactions from an
external master.

Steps:
1. Study `api/src/target.rs` — it already defines `I2cTargetClient`.
2. Add opcodes for `EnableTarget`, `DisableTarget`, `WaitForMessages`.
3. Add backend methods using the HAL's slave traits
   (`I2cSlaveCore`, `I2cSlaveBuffer`).
4. The server needs a way to multiplex between master IPC and slave events
   — this is a design challenge.

### Exercise 4: Add a Second Client

**Goal:** Run two client processes that share the I2C server.

Steps:
1. Add a third app in `system.json5` with its own `channel_initiator`
   pointing at the server.
2. Add a second `channel_handler` object in the server's `objects` array
   (or use the same one with a second thread).
3. Reason about concurrency: what happens if both clients request
   operations on the same bus simultaneously?

---

## Summary: The Eight Artifacts

Every pw_kernel userspace driver requires exactly these artifacts:

```
 1. api/src/wire.rs              ← wire protocol
 2. api/src/*.rs                 ← types, traits, errors
 3. backend-<soc>/src/lib.rs     ← hardware adapter
 4. server/src/main.rs           ← dispatch loop
 5. client/src/lib.rs            ← IPC client library
 6. system.json5                 ← process/channel/memory layout
 7. BUILD.bazel (×5+)            ← build rules
 8. tests/                       ← integration test binary
```

The design deliberately separates concerns so that you can change any one
layer — protocol, hardware, client ergonomics, memory layout — without
touching the rest.
