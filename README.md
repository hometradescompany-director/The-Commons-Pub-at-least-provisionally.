# The Commons Pub

Local-only, deterministic cognitive-state simulator and small 2D demo. This is
a simulation, not an agent runtime: it does not connect to models, execute
tools, alter permissions, or claim consciousness or actual impairment.

## Run locally

Requires Node.js 20 or newer. No package installation or external dependencies
are needed.

```sh
npm test
npm run demo
```

Open the printed `http://127.0.0.1:4173` address. The demo server binds only to
loopback, serves a fixed file allowlist, and disables outbound browser
connections. Consent is optional; decline, cancel, disconnect, expiry, and
emergency reset leave the session safely at baseline. The observer fixture is
read-only.

## Simulator and provenance

The simulator and fixtures are in `src/`; the v1 JSON Schema for participant,
observer, session, and event records is `schemas/pub-simulator-v1.schema.json`.
Sessions use bounded logical ticks and a caller-supplied 32-bit seed. The seed,
version, participant/observer fixture IDs, event sequence, event data, and
predecessor hashes are recorded in an in-memory SHA-256 hash chain. Verify a
receipt with `simulator.verifyAudit(simulator.getReceipt(sessionId))`.
Hash chaining detects changed receipt contents; it is not a digital signature
or proof of who created the receipt.

Modulation only changes deterministic choice ordering and a displayed timing
value; it does not introduce actual delays or affect canonical identity,
authority, or tools. The simulator accepts only built-in public fixtures and
stores no prompts, memories, credentials, or user-provided choice text. Each
simulator instance allows at most 8 active sessions, 100 recorded sessions,
1,000 ticks per session, and 512 events per session (defaults are lower).

The 2D demo uses `demo/renderer-2d.js` as a renderer adapter over simulator
snapshots; a future 3D renderer can implement the same presentation seam. No
3D renderer is included or claimed.

## Verification receipt and limits

Verified locally on 2026-11-23 with Node.js 22: `npm test` passes 13 tests
covering deterministic replay, consent/refusal, concurrency, privilege
escalation denial, cancellation, disconnect, expiry, recovery, reset,
malformed input, isolation, and audit tampering. No external framework code,
assets, model prompts, or dependencies were copied or added; the repository's
Apache-2.0 license remains in force.

This v0.1 slice is an in-memory prototype, not durable storage, a production
consent system, or a security boundary around a real agent. Its hash chain is
unsigned; a party able to rewrite the complete receipt can recompute it. It
received a Playwright browser smoke check on 2026-11-23 for the 2D render,
consent/refusal, modulation, choices, recovery, and reset. No screenshot is
attached; this is not cross-browser or assistive-technology certification. It
has no 3D renderer (not browser verified), external execution, federation, or
private-state integration.

See [the architecture research and pinned-source matrix](docs/ARCHITECTURE_RESEARCH.md).
