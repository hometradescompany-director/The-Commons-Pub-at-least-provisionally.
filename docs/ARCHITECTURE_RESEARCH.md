# Public architecture survey and provenance

Reviewed 2026-11-23. Each source link pins the observed default-branch commit
and its commit date; license links point to the corresponding snapshot. These
are public-source observations, not endorsements, security audits, or
recommendations to run these frameworks. No source code or assets from these
projects were copied into the Commons Pub.

| Source / pinned revision | License | Capability observed | Adoption cost and security / provenance risks | Decision for this slice |
|---|---|---|---|---|
| [OpenAI Swarm](https://github.com/openai/swarm/commit/6af0b4caf37dca4526dfd98e9fbd8ce36e7eeb22) · 2026-04-15 | [MIT](https://github.com/openai/swarm/blob/6af0b4caf37dca4526dfd98e9fbd8ce36e7eeb22/LICENSE) | Educational, lightweight agent/function abstraction with handoffs; README says it is experimental and replaced by the Agents SDK. | Low framework cost, but its loop executes functions, the documented turn limit defaults to unbounded, and it depends on an API-backed runtime. | **Decline** runtime; retain only as historical baseline. The Pub has no agent loop or callable tools. |
| [OpenAI Agents SDK (Python)](https://github.com/openai/openai-agents-python/commit/6c4e4a29cd08eef454db6980d74da6afc8939d24) · 2026-11-20 | [MIT](https://github.com/openai/openai-agents-python/blob/6c4e4a29cd08eef454db6980d74da6afc8939d24/LICENSE) | Tools, handoffs, guardrails, human-in-the-loop, sessions, tracing, and sandbox agents. | Python and model/runtime integration are beyond this local JavaScript demo; tools, model calls, traces, and session persistence create execution and data-handling boundaries. | **Decline** runtime; the canonical/simulation separation is implemented locally without a model or tool adapter. |
| [Agency Swarm](https://github.com/VRSEN/agency-swarm/commit/016189784354b4298ed25de752d22013ee5b5511) · 2026-11-16 | [MIT](https://github.com/VRSEN/agency-swarm/blob/016189784354b4298ed25de752d22013ee5b5511/LICENSE) | Agent roles, directional communication flows, typed tools, and configurable thread persistence on the Agents SDK. | Adds a Python framework and persistent conversations; tool calls and persisted threads need explicit authorization, minimization, and retention controls. | **Decline**; one fixture participant and one read-only observer do not need orchestration. |
| [Microsoft AutoGen](https://github.com/microsoft/autogen/commit/8390985108cb1e3881f5f7297765758d8ad2540c) · 2026-11-12 | Code: [MIT](https://github.com/microsoft/autogen/blob/8390985108cb1e3881f5f7297765758d8ad2540c/LICENSE-CODE). The root `LICENSE` is [CC BY 4.0](https://github.com/microsoft/autogen/blob/8390985108cb1e3881f5f7297765758d8ad2540c/LICENSE). | Multi-agent teams and human collaboration; the README marks the project archived and warns that MCP servers may execute local commands. | Python packages and provider/MCP configuration; the archived project has no new fixes, and connected MCP servers create a command-execution boundary. | **Decline**; archive/security posture and runtime execution do not fit a local simulator. |
| [CrewAI](https://github.com/crewAIInc/crewAI/commit/3c53d5073b5f29cfbf707cfa79e5843f11162a87) · 2026-11-23 | [MIT](https://github.com/crewAIInc/crewAI/blob/3c53d5073b5f29cfbf707cfa79e5843f11162a87/LICENSE) | Autonomous role-based Crews and event-driven Flows. | Requires a Python orchestration layer and model/tool setup; agent actions and provider interactions introduce external effects and data flows. | **Decline**; do not add autonomy or external calls to the bounded demo. |
| [LangGraph](https://github.com/langchain-ai/langgraph/commit/c6335a4255dc1d8abc25a7677f9c072c7ab27b9c) · 2026-11-20 | [MIT](https://github.com/langchain-ai/langgraph/blob/c6335a4255dc1d8abc25a7677f9c072c7ab27b9c/LICENSE) | Stateful graph orchestration, durable execution, checkpoints, and human interrupts. | A graph/runtime and durable persistence are substantial additions; checkpoints and traces require retention, access, and recovery policies. | **Adapt** the general ideas of explicit state transitions and recovery; no LangGraph package or code is used. |
| [Agent2Agent (A2A)](https://github.com/a2aproject/A2A/commit/5f931b8a25fe66789f987ec4a55fc16ee9fe41ee) · 2026-11-18 | [Apache-2.0](https://github.com/a2aproject/A2A/blob/5f931b8a25fe66789f987ec4a55fc16ee9fe41ee/LICENSE) | Network protocol for agent discovery and cross-framework tasks, including streaming and asynchronous updates. | Requires network transport, identity/authentication, peer trust, and task lifecycle management; remote agents and payloads enlarge the authority and provenance surface. | **Decline**; no federation or network connectivity is in scope. |
| [Swarm Home Hub](https://github.com/hometradescompany-director/Swarm-Home-Hub/commit/abfb7e6397b4d0f2dfdb2e74d34b2adfc0f6bbc2) · 2026-10-17 | **No open-source license.** Its [`LEGAL.md`](https://github.com/hometradescompany-director/Swarm-Home-Hub/blob/abfb7e6397b4d0f2dfdb2e74d34b2adfc0f6bbc2/LEGAL.md) explicitly says public visibility grants no reuse rights. | Public docs/source show append-only transition events, predecessor checks, state projections, bounded capacity, and separation of evidence from authority. | Integration would couple the Pub to a distinct identity/authority owner and the Hub's contracts; public source is not itself permission to copy or redistribute. | **Adapt only non-code design lessons independently** (state/replay and explicit ownership boundaries); **decline** source-code reuse and direct integration absent permission and a reviewed contract. |

## Findings applied here

- Keep simulation state, canonical fixture identity/authority labels, audit
  events, and rendering as separate concerns.
- Version each participant, observer, session, and event; record a seeded,
  logical-time replay trail with a predecessor-linked hash chain.
- Refuse missing consent, full concurrency, unsupported input fields, and all
  external-tool requests; reset on cancellation, disconnect, expiry, or an
  event budget limit.
- Do not treat framework handoffs, evidence receipts, public visibility, or
  agent presence as authority.

## Local provenance receipt

- Scope: Commons Pub simulator v0.1, this repository, one participant fixture,
  one read-only observer fixture.
- Implementation: original JavaScript, JSON Schema, tests, and static 2D
  presentation; Node built-ins and browser Web Crypto only; no dependency
  installation, model call, external agent execution, or third-party assets.
- License: repository Apache-2.0; no third-party code or notices were added.
- Verification: `npm test` passes the 13 local tests. A Playwright browser
  smoke check exercised the 2D surface, consent/refusal, modulation, choices,
  recovery, and reset. No screenshot is attached; there is no cross-browser or
  assistive-technology certification. The demo server uses a fixed path
  allowlist and loopback binding.
- Limits: receipt hashes detect modifications but are unsigned; there is no
  durable audit storage, live capability integration, federation, or 3D scene.
  No 3D scene was rendered or browser verified.
