# inferpipe Moat — Competing Post–OpenAI Agent Builder (MVP-constrained)

## Executive Thesis

OpenAI Agent Builder is a powerful, vertically integrated platform. inferpipe can still win by owning the cross-provider, cost-governed, and governance-first layer that businesses need when they want portability, predictable spend, and reproducible workflows. Our wedge is not “more UI” or “more integrations,” but a focused stack that delivers measurable cost savings, tighter control, and enterprise-ready guardrails across any model vendor.

Positioning: “inferpipe is the AI cost-and-control orchestrator. Build visual workflows that are versioned, unit-tested, budget-capped, and portable across model providers.”

---

## Why inferpipe should exist (despite OpenAI’s launch)

- Vendor lock-in is real: many teams must avoid tying core logic to a single provider (cost, policy, availability, region, legal risk). Portability is the hedge.
- Cost pressure will intensify: CFOs demand predictability and savings. A platform that optimizes across providers and enforces budgets is a clear win.
- Governance and reproducibility: AI changes are risky. Product/Legal need approvals, version pinning, test datasets, and change diffs before rollout.
- Data constraints: EU residency, PII policies, “stateless” processing, limited data retention, optional private runners. Not all teams can centralize on one vendor.
- Developer reality: many apps already have infra. They need a clean backend SDK, webhooks, and an export-to-code path (no hard platform lock-in).

---

## Core Differentiators (practical for an MVP)

1. Cost Guardrails and Optimizer (MVP focus)

- Per-step and per-workflow budget caps. Hard stops and automatic fallbacks (e.g., GPT-4 → Claude Sonnet → GPT-3.5/Haiku) based on policies.
- Pre-run cost estimator and post-run real costs per step with tokens/time. Show savings vs default OpenAI-only routing.
- “Cheapest acceptable output” policy: run a tiny canary on multiple models and choose the lowest-cost model that passes acceptance tests.

2. Reproducibility and Governance (AI “unit tests” for workflows)

- Version pinning for prompts, models, parameters. Immutable run metadata.
- Golden dataset runner: compare outputs across versions/providers; surface diffs, regressions, and cost deltas before deploy.
- Lightweight approval workflow: require “tests pass” + approver sign-off to publish a version.

3. Portability and Open Spec

- Open workflow JSON format; import/export guaranteed. No hidden state. Keep the format documented and stable.
- One-click “Export to Code” (Inngest TS function). Users can self-host critical paths or embed in their stack.

4. Data Residency and Isolation (trust as a feature)

- “Stateless Mode”: we do not store inputs/outputs beyond processing unless explicitly enabled for debugging.
- Region selection (start with EU/US hints), configurable retention windows, PII redaction pre/post.
- Optional private runner (thin worker that executes steps inside customer VPC) as a paid add-on later; MVP can simulate via limited self-host CLI.

5. Developer-First Integration Surface (small, sharp APIs — not hundreds of connectors)

- Simple backend SDK (execute, async, stream, webhooks verify) matching `prompts/sdk.md`.
- HTTP step + Webhook node as the universal “integration escape hatch” to fit any stack today (works with n8n/Make/Zapier too).
- Clear idempotency, retries, tracing hooks; predictable error model.

6. AI-Native Observability (what PMs and CFOs actually need)

- Per-step token/time/cost, run timelines, failure reasons, retry paths.
- “What changed?” diff viewer for prompt/model/version changes with side-by-side outputs.
- Cost heatmaps across workflows and providers; anomaly alerts when costs drift.

7. Model Risk Mitigation

- Multi-provider fallback and throttling strategies to ride out outages/rate limits.
- Policy engine: “never exceed $X per run,” “prefer $/quality under threshold Y,” “avoid provider Z for PII.”

---

## Deliberate Non-Goals (avoid scope creep vs n8n/Make)

- We will NOT chase hundreds of SaaS connectors. Provide an HTTP/Webhook escape hatch and 2–3 high-impact data connectors only (e.g., Postgres, S3, GDrive) to start.
- We will NOT build a full end-user chat UI framework (OpenAI has ChatKit). Our focus is backend execution, cost, and governance.
- We will NOT build general-purpose automation primitives unrelated to LLMs.

This keeps the product sharp and shippable by a solo dev while still meaningfully differentiated.

---

## Target Segments and Why

- Mid-Market SaaS and AI-savvy SMBs
  - Care about portability and budget predictability; have engineers to embed SDKs.
  - Often serve regulated or EU customers; data residency and low-retention matter.
  - Want an optimization layer to reduce spend without sacrificing output quality.

- Agencies/Consultancies (early monetization wedge)
  - Run many similar workflows for multiple clients; “optimizer + approval + export-to-code” is compelling.
  - A golden-dataset approach makes client approvals smoother; cost reports justify fees.

Enterprise motion later: add private runners, SSO/audit, and attestations once the wedge is proven.

---

## MVP Scope (4–8 weeks)

1. Cost Guardrails + Optimizer (core)

- Budget caps per workflow/step; hard/soft stop actions.
- Canary multi-model probe on a small sample; route to the cheapest passing model.
- Cost estimator and real cost reporting (tokens, time, USD) per step.

2. Golden Dataset + Diff Viewer (governance)

- Upload/define 10–50 test cases per workflow with expected characteristics.
- “Run comparison” across versions/providers; visualize diffs and pass/fail.
- Require “tests pass” + approver to publish a version.

3. Open Spec + Export to Code (portability)

- Documented workflow JSON; import/export.
- One-click export to Inngest TS function (align with current `packages/backend/convex` execution model).

4. Developer SDK v0 (per `prompts/sdk.md`)

- Methods: execute, executeAsync, executeStream, get/cancel execution, webhooks.verify.
- Idempotency, retries, simple tracing hooks.

5. Minimal Integrations (keep it tiny but useful)

- HTTP step + Webhook node.
- Postgres reader, S3 file fetcher, Google Drive file fetcher (one well-done connector is better than three half-done; pick the fastest to ship first).

6. Templates to Prove Value

- 3–5 business-ready templates with golden datasets:
  - Content brief → outline (optimize for cost with acceptable quality).
  - Support triage → category + next action (guardrails + fallback).
  - Lead enrichment → firmographics from URL (HTTP step + LLM transform).

---

## Pricing and Value Promise (aligned with `prompts/pricing.md`)

- Transparent pass-through model costs + small execution fee.
- “Cost Optimization Guarantee” (pilot): if our optimizer doesn’t save ≥20% over OpenAI-only routing on your golden dataset in a month, waive the platform fee the next month. Start this as a manual program for early adopters.
- Clear budget controls to prevent end-of-month surprises. CFO-friendly reports by workflow/team.

---

## Go-To-Market Experiments

- Cost Bake-Off Landing: upload a CSV (10–50 rows) + prompt; we run across providers and show cost/quality diffs. One-click “adopt this policy.”
- Case Study Content: “How X saved 38% by routing away from GPT-4 when not needed.”
- Dev-Focused Docs + SDK snippets: frictionless embedding; highlight export-to-code.
- Agency Partner Early Access: prioritize features that make approvals/reporting effortless.

---

## Risks and Mitigations

- OpenAI expands into multi-model + budgeting: keep the open spec, export-to-code, and private runner roadmap as our hedge; double down on portability and compliance posture.
- Provider quality divergence narrows: optimizer still valuable for cost spikes, outages, and regional/legal constraints.
- Solo-founder velocity: scope discipline; ship the 3 core proof-points first (guardrails, golden tests, export-to-code). Defer everything else.

---

## 90-Day Proof Plan (what we must prove to raise or sustain)

- Measurable Savings: show ≥20–40% cost reduction on 2–3 real customer workflows without unacceptable quality loss.
- Governance Adoption: at least 1 customer uses golden dataset + approvals to ship changes safely.
- Portability in Practice: at least 1 workflow exported-to-code and running in customer infra.

If these are true, we own a defensible wedge: cost, control, and portability across providers — complementary to, not replaced by, OpenAI Agent Builder.

---

## One-Line Positioning

“AI workflows you can trust: portable, tested, and within budget.”
