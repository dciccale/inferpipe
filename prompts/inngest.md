## Inngest as Execution Infrastructure — Architecture Plan

### Context

- MVP: executions currently run inside Convex for simplicity.
- Direction: move workload execution (short and long-running) to Inngest; keep Convex as management/state layer (builder, auth, workspaces, usage, billing, UI streaming).

### Principles

- Async-first: every workflow may exceed HTTP request lifetime
- Observable in-app: show runs, steps, logs, traces in our dashboard
- Cost-aware & reliable: retries, idempotency, backoff, DLQs
- Security: tenant isolation, API keys, signed webhooks

---

## Execution Model (Start → Steps → End)

- Start: a workflow invocation with input (HTTP request, CRON, internal trigger). Input is arbitrary JSON.
- Steps: each node executes a task. MVP task = LLM call producing text or JSON. Future tasks: HTTP call, transform, branch, map/reduce, file ops.
- End: final output object emitted by the workflow; status = completed/failed/canceled.
- Identifiers: `runId` (global), `workflowId` (definition), `workspaceId` (tenant). All emitted telemetry is scoped by `runId`.

### Step Observability (per node)

- Capture: inputs, outputs, start/finish timestamps, duration, attempt, error (code/message), provider usage (tokens/cost), model settings.
- Persist: use Inngest step jobs for ground-truth; mirror summarized fields into our store for UI.

---

## Mapping to Inngest Runtime

- Single Orchestrator Function per workflow version:
  - `execute-workflow` receives event `{ workflowVersionId, runId, input }` with the entire graph.
  - It iterates the graph topologically and executes node steps with `step.run("node-<id>", ...)`.
  - Each step calls providers (e.g., OpenAI) and returns outputs; errors bubble with retry metadata.
  - The function returns the final aggregated output.

- Why one function vs many:
  - MVP simplicity; `step.run` yields per-step jobs with names that we can later hydrate via API.
  - Advanced: split into multiple Inngest functions per node type if we need parallelism or isolation.

---

## Programmatic Observability (No webhooks)

Inngest Cloud exposes an API we can poll to embed observability data in-app:

- Events (list/get), function runs (get/cancel), function run jobs (list). See Inngest API v1 reference: [Inngest Cloud API v1](https://api-docs.inngest.com/docs/inngest-api/1j9i5603g5768-introduction).

Planned usage:

- Store `runId` when invoking the workflow.
- Poll "Get a function run" for overall status (queued/running/completed/failed) and timestamps.
- Poll "Fetch function run jobs" to render step timeline, durations, and outcomes.
- Optional: correlate to our `workflowId`/`nodeId` via `step.run` names and metadata.

Benefits:

- Embedded, white-label observability without building our own execution engine.
- Consistent with Inngest dashboard data; we can deep-link for advanced details.

---

## Data Model (Mirrored in Convex)

- runs: { id, workflowId, workspaceId, status, inputRef, outputRef, cost, tokens, createdAt, updatedAt }
- steps: { id, runId, nodeId, name, status, inputRef, outputRef, tokens, cost, startedAt, finishedAt, durationMs }
- logs: { id, runId, stepId, level, message, metadata, timestamp }

Use object storage for large payloads; store refs in Convex.

---

## Orchestrator Example (Inngest)

```ts
// inngest runtime
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "inferpipe" });

// Execute a workflow described by a graph from our builder
export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "inferpipe/workflow.execute" },
  async ({ event, step }) => {
    const { runId, workspaceId, workflowVersionId, graph, input } = event.data;

    const nodeIdToResult: Record<string, unknown> = {};

    for (const node of graph.topologicallySortedNodes) {
      if (node.type === "llm") {
        const result = await step.run(`node-${node.id}-llm`, async () => {
          // Call provider (OpenAI, etc.) using node.config
          // Return structured { output, tokens, cost, model }
          return await callLLM({
            model: node.config.model,
            prompt: renderPrompt(node.config.prompt, input, nodeIdToResult),
          });
        });

        nodeIdToResult[node.id] = result;
      } else if (node.type === "transform") {
        const result = await step.run(`node-${node.id}-transform`, async () => {
          return transformData(node.config.script, nodeIdToResult);
        });
        nodeIdToResult[node.id] = result;
      }
    }

    const finalOutput = nodeIdToResult[graph.outputNodeId];
    return { runId, output: finalOutput };
  }
);
```

Notes:

- Each `step.run` name encodes `node.id` for later correlation when fetching jobs.
- Provider calls should return token/cost info for UI.

---

## Backend Integration (Convex) — Trigger/Status/Cancel

We’ll call Inngest from our backend and expose actions for the app.

```ts
// Trigger execution (send event)
await inngestClient.send({
  name: "inferpipe/workflow.execute",
  data: { runId, workspaceId, workflowVersionId, graph, input },
});

// Later, poll run status and jobs using Cloud API v1
const run = await getFunctionRun(runId);
const jobs = await getFunctionRunJobs(runId);

// Cancel execution on user request
await cancelFunctionRun(runId);
```

Endpoints used (subject to Inngest API v1):

- GET function run
- GET function run jobs
- DELETE cancel function run
- GET list events / get event (optional correlation)

Reference: [Inngest Cloud API v1](https://api-docs.inngest.com/docs/inngest-api/1j9i5603g5768-introduction)

---

## Dynamic Compilation of Workflows

- At save-time:
  - Validate graph (DAG, required inputs, model availability).
  - Annotate nodes with stable `node.id` and step labels `node-<id>-<type>`.
  - Persist a `compiled` payload with minimal execution data (no secrets).

- At run-time:
  - Send `graph` + `input` to the Inngest function (or `workflowVersionId` with a server fetch inside function).
  - Or pre-register an Inngest function per workflow version if dynamic code is needed (advanced); MVP keeps a single generic function and interprets graph dynamically.

---

## Example: Polling for Observability

```ts
// server util (Convex action or server route)
async function getFunctionRun(runId: string) {
  const res = await fetch(
    `${process.env.INNGEST_API_BASE ?? "https://api.inngest.com"}/v1/runs/${runId}`,
    {
      headers: { Authorization: `Bearer ${process.env.INNGEST_API_KEY}` },
    }
  );
  if (!res.ok) throw new Error(`Failed to fetch run: ${res.status}`);
  return res.json();
}

async function getFunctionRunJobs(runId: string) {
  const res = await fetch(
    `${process.env.INNGEST_API_BASE ?? "https://api.inngest.com"}/v1/runs/${runId}/jobs`,
    {
      headers: { Authorization: `Bearer ${process.env.INNGEST_API_KEY}` },
    }
  );
  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
  return res.json();
}

async function cancelFunctionRun(runId: string) {
  const res = await fetch(
    `${process.env.INNGEST_API_BASE ?? "https://api.inngest.com"}/v1/runs/${runId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${process.env.INNGEST_API_KEY}` },
    }
  );
  if (!res.ok) throw new Error(`Failed to cancel run: ${res.status}`);
}
```

---

## Caveats & White-Label Considerations

- API Coverage: Cloud API provides run and job data, but some log detail or provider-specific metadata might be dashboard-only. Plan for gaps and use deep-links for advanced triage. See [Inngest Cloud API v1](https://api-docs.inngest.com/docs/inngest-api/1j9i5603g5768-introduction).
- Retention: Historical data TTL may apply; mirror summarized data we care about for long-term analytics.
- Redaction: Sensitive inputs/outputs should be redacted before persisting in our store; use secrets vault for provider keys.
- Limits & Quotas: Polling intervals and rate limits must be respected; exponential backoff and per-run cooldowns.
- Step Naming: Consistent `step.run` labels are critical for correlating jobs back to workflow nodes.
- Dynamic Code: Interpreting graphs inside a single Inngest function is flexible but can be harder to type-check; consider codegen for performance later.

---

## Migration Plan (Convex → Inngest)

1. Dual-run shadowing

- Keep Convex executor for MVP; enable flag to submit duplicate runs to Inngest for parity testing

2. Cutover by workflow

- Promote stable workflows to Inngest-only; keep Convex as state mirror

3. Remove Convex execution

- All executions go to Inngest; Convex handles control plane + UI
