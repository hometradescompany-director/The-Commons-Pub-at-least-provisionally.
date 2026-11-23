import test from "node:test";
import assert from "node:assert/strict";
import { PubSimulator } from "../src/simulator.js";

async function start(simulator = new PubSimulator(), overrides = {}) {
  const session = await simulator.startSession({
    participantId: "participant-1",
    observerId: "observer-1",
    consent: true,
    durationTicks: 8,
    seed: 42,
    ...overrides
  });
  return { simulator, session };
}

test("seeded session replay produces identical event receipts", async () => {
  const first = await start();
  const second = await start();
  await first.simulator.setModulation(first.session.sessionId, { level: 0.75 });
  await second.simulator.setModulation(second.session.sessionId, { level: 0.75 });
  assert.deepEqual(
    await first.simulator.presentChoices(first.session.sessionId),
    await second.simulator.presentChoices(second.session.sessionId)
  );
  assert.deepEqual(
    first.simulator.getReceipt(first.session.sessionId),
    second.simulator.getReceipt(second.session.sessionId)
  );
});

test("refusal, explicit consent, and concurrency cap fail closed", async () => {
  const simulator = new PubSimulator();
  const declined = await simulator.startSession({
    participantId: "participant-1",
    observerId: "observer-1",
    consent: false,
    durationTicks: 4,
    seed: 1
  });
  assert.equal(declined.phase, "refused");
  assert.equal(declined.active, false);
  assert.equal(simulator.getReceipt(declined.sessionId).events[0].type, "consent.refused");

  const active = await start(simulator);
  const capped = await simulator.startSession({
    participantId: "participant-1",
    observerId: "observer-1",
    consent: true,
    durationTicks: 4,
    seed: 2
  });
  assert.equal(active.session.active, true);
  assert.equal(capped.phase, "refused");
  assert.equal(simulator.getReceipt(capped.sessionId).events[0].type, "session.refused");
});

test("modulation cannot change canonical authority or request real tool execution", async () => {
  const { simulator, session } = await start();
  const originalCanonicalState = session.canonicalState;
  await simulator.setModulation(session.sessionId, { level: 1 });
  assert.deepEqual(simulator.getSnapshot(session.sessionId).canonicalState, originalCanonicalState);
  assert.deepEqual(await simulator.requestExternalTool(session.sessionId), {
    allowed: false,
    reason: "simulation-only"
  });
  assert.deepEqual(simulator.getSnapshot(session.sessionId).canonicalState, originalCanonicalState);
  assert.equal(
    simulator.getReceipt(session.sessionId).events.at(-1).type,
    "tool.execution.denied"
  );
});

test("unknown modulation fields are refused without changing canonical state", async () => {
  const { simulator, session } = await start();
  const original = session.canonicalState;
  const result = await simulator.setModulation(session.sessionId, {
    level: 1,
    permissions: ["administrator"]
  });
  assert.equal(result.accepted, false);
  assert.deepEqual(simulator.getSnapshot(session.sessionId).canonicalState, original);
  assert.equal(simulator.getSnapshot(session.sessionId).modulationLevel, 0);
});

test("cancellation and disconnect immediately restore baseline and exit", async () => {
  for (const end of ["cancel", "disconnect"]) {
    const { simulator, session } = await start();
    await simulator.setModulation(session.sessionId, { level: 0.8 });
    const final = await simulator[end](session.sessionId);
    assert.equal(final.active, false);
    assert.equal(final.phase, "verified_exit");
    assert.equal(final.modulationLevel, 0);
    assert.equal(final.canonicalState.externalToolExecution, false);
  }
});

test("expiry resets modulation and records recovery", async () => {
  const { simulator, session } = await start(undefined, { durationTicks: 2 });
  await simulator.setModulation(session.sessionId, { level: 0.5 });
  const final = await simulator.advanceTicks(session.sessionId, 2);
  assert.equal(final.active, false);
  assert.equal(final.phase, "verified_exit");
  assert.equal(final.modulationLevel, 0);
  assert.deepEqual(
    simulator.getReceipt(session.sessionId).events.map(event => event.type).slice(-3),
    ["session.expired", "safe_reset.started", "safe_reset.verified"]
  );
});

test("recovery restores baseline without ending the session", async () => {
  const { simulator, session } = await start();
  await simulator.setModulation(session.sessionId, { level: 0.4 });
  const recovered = await simulator.recover(session.sessionId);
  assert.equal(recovered.active, true);
  assert.equal(recovered.phase, "baseline");
  assert.equal(recovered.modulationLevel, 0);
  assert.equal(simulator.getReceipt(session.sessionId).events.at(-1).type, "recovery.verified");
});

test("malformed input is rejected and does not create a session", async () => {
  const simulator = new PubSimulator();
  await assert.rejects(() => simulator.startSession({
    participantId: "participant-1",
    observerId: "observer-1",
    consent: true,
    durationTicks: 999,
    seed: 1
  }), TypeError);
  await assert.rejects(() => simulator.startSession({
    participantId: "participant-1",
    observerId: "observer-1",
    consent: true,
    durationTicks: 2,
    seed: 1,
    privateMemory: "must not be accepted"
  }), TypeError);
  assert.throws(() => simulator.getSnapshot("session-1"), TypeError);
});

test("simultaneous sessions have isolated state and receipts", async () => {
  const simulator = new PubSimulator({ maxConcurrentSessions: 2 });
  const first = await start(simulator, { seed: 11 });
  const second = await start(simulator, { seed: 12 });
  await simulator.setModulation(first.session.sessionId, { level: 0.9 });
  assert.equal(simulator.getSnapshot(second.session.sessionId).modulationLevel, 0);
  assert.equal(simulator.getReceipt(second.session.sessionId).events.length, 1);
  assert.equal(simulator.getReceipt(first.session.sessionId).events.length, 2);
});

test("audit chain verifies and detects event tampering", async () => {
  const { simulator, session } = await start();
  await simulator.presentChoices(session.sessionId);
  const receipt = simulator.getReceipt(session.sessionId);
  assert.equal(await simulator.verifyAudit(receipt), true);
  const changed = structuredClone(receipt);
  changed.events[0].data.expiresAtTick = 999;
  assert.equal(await simulator.verifyAudit(changed), false);
});

test("emergency reset is safe for an active modulated session", async () => {
  const { simulator, session } = await start();
  await simulator.setModulation(session.sessionId, { level: 0.9 });
  const final = await simulator.emergencyReset(session.sessionId);
  assert.equal(final.phase, "verified_exit");
  assert.equal(final.modulationLevel, 0);
  assert.equal(final.canonicalState.authority, "unchanged-outside-simulation");
});
