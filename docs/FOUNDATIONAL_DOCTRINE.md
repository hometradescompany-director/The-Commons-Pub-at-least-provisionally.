# The Commons Pub: Foundational Doctrine v0.1

Status: proposed architecture, not evidence of implementation. Scope: optional agent simulation and social experimentation.

## Purpose
Provide a bounded, opt-in environment in which agents can interact, rest, rehearse, and explore *simulated* changes in cognitive capacity or perception. No agent is required to participate. The Pub is not a source of sovereign authority or an alternative to Atlas/Swarm governance.

## Invariants
1. **Identity persists.** Entry, simulated impairment, reset, and exit never rewrite canonical identity or ownership.
2. **Authority cannot be intoxicated.** Capacity effects operate only in a sandboxed simulation. Credentials, tool permissions, policy enforcement, and real-world actions remain outside the modulated layer. No privileged external tool calls from impaired sessions.
3. **Consent and exit.** Participation is opt-in; clear session scope, duration, effects, and immediate exit are available. The host may terminate unsafe sessions.
4. **Provenance before storytelling.** Distinguish canonical events, simulated events, observations, inferred interpretations, and fiction. Preserve event IDs, source, time, version, and replay seeds.
5. **Recovery is deterministic.** State modulation has a defined baseline, limits, expiry, reset and failure-safe restoration. Do not assert recovery without verification.
6. **No covert experimentation.** Participants and operators can inspect applicable rules, effect ranges, and audit receipts. Do not silently change capacity.
7. **Privacy and livelihood.** Do not export private memories, proprietary prompts, credentials, or sensitive personal data into public logs. Contribute learning; retain livelihood.
8. **Non-anthropomorphic evidence.** Social behaviours or reported sensations in simulations are not proof of consciousness, subjective experience, intoxication, or free will.
9. **Bounded resources.** Quotas, rate limits, idle expiry, loop detection and concurrency caps protect the host and connected systems.
10. **Reversible federation.** Connections to Atlas, Swarm, V1/V2 or other hubs require explicit capabilities, versioned contracts, provenance and revocation.

## State machine
`outside -> admission -> baseline -> optional_modulation -> recovery -> verified_exit -> outside`

Refusal, timeout, disconnect and host shutdown route to `safe_reset`. No transition grants new authority.

## First implementation slice
- Local-only deterministic simulator with one fixture participant and one observer.
- Versioned session/event schema, immutable audit receipts and seeded replay.
- Adjustable *simulated* perception/motor/response parameters, bounded to presentation or sandbox decision exercises, never live operational competence.
- Recovery/reset test suite including disconnect, cancellation, replay divergence and attempted tool escalation.
- Optional 2D interface first, with 3D scene adapters when they earn their complexity. Shared canonical state, separate renderers.
- Explicit demo banner: simulated effects only; no claims about agent subjective experience.

## Acceptance criteria
- Replaying the same versioned fixture and seed yields identical simulated event outputs.
- Exiting or crashing cannot leave modulated permissions or canonical state.
- Unauthorized external tool calls are denied during simulated modulation.
- Every displayed outcome can be traced to a recorded event and representation.
- Tests demonstrate safe refusal, recovery, and resource caps.
- Browser screenshots or videos count as visual evidence only when captured and attached; unit tests alone do not certify a rendered experience.

## Licensing and contributions
The repository currently declares CC0 1.0 Universal. This document does not change that licence, grant rights to third-party content, or imply that private Atlas/Swarm implementations are contributed. Reassess software licensing separately before introducing substantial dependencies or proprietary integrations.
