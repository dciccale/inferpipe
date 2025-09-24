## Infra and Backend Architecture

### Principles

- Async-first: every workflow is safe to run longer than a single HTTP request
- Observable: first-class tracing, logs, and metrics for each run
- Cost-aware: minimize idle, leverage managed infra for MVP
- Secure by default: tenant isolation, secrets management, signed webhooks

### Hybrid Architecture: Convex + Inngest

**Strategic Decision: Best-of-Both-Worlds Approach**

**Convex for Dashboard & Management Layer:**
- Real-time UI updates and visual workflow builder
- User management, authentication, and workspace data
- Workflow definitions, templates, and configuration
- API gateway and request routing
- Usage analytics and billing management

**Inngest for Execution Infrastructure:**
- Actual workflow orchestration and step execution
- Long-running job processing (unlimited duration)
- Robust retry logic and error handling
- Enterprise-grade observability and monitoring
- LLM provider integrations and API management

### Why This Combination Works

**Convex Strengths (Dashboard Layer):**
- Exceptional developer experience for UI state management
- Real-time subscriptions perfect for workflow monitoring
- Built-in authentication and data validation
- Type-safe APIs with automatic client generation
- Serverless scaling for user-facing operations

**Inngest Strengths (Execution Layer):**
- Purpose-built for complex, long-running workflows
- Enterprise-grade reliability and failure handling
- Sophisticated event-driven architecture
- Production-ready from day one
- Proven at scale with other platforms

**Integration Strategy:**
- Convex stores workflow definitions and triggers Inngest executions
- Inngest reports status back to Convex for real-time UI updates
- Shared authentication and security model
- Unified observability and monitoring across both platforms

### Long-Running Jobs

**Inngest Handles All Execution Complexity:**

- **Unlimited Duration:** No time limits on workflow execution
- **Automatic Step Persistence:** Built-in state management between steps
- **Intelligent Retry Logic:** Sophisticated failure handling and backoff
- **Step-by-Step Execution:** Natural atomic step processing
- **Event-Driven Orchestration:** Steps can wait for external events

**Convex Integration for Real-Time Updates:**
- Inngest sends progress events to Convex
- Convex streams updates to UI in real-time
- Users see live workflow progress without polling
- Execution logs and metrics available immediately

### Streaming

- SSE for UI preview and developer console
- For API consumers:
  - Option A: HTTP chunked response (SSE) for short runs
  - Option B: immediate 202 Accepted with `runId` and optional webhook; client polls or listens

### Webhooks

- Outbound webhooks on completion/failure with signed HMAC (secret per destination)
- Retries with exponential backoff; dead-letter table for failed deliveries
- Delivery history retained 14-30 days

### Multi-Tenancy & Security

- Workspace model with RBAC (Owner, Admin, Editor, Viewer)
- Row-level isolation via workspaceId on all entities
- API keys scoped to workspace; optional per-workflow keys
- Secrets vault per workspace (providers, webhooks) stored encrypted

### Rate Limiting & Idempotency

- Rate limits per API key (burst + sustained)
- Idempotency-Key on run creation to avoid duplicates
- Step-level de-duplication when retried

### Observability

- Structured logs per run and step
- Trace id = runId; step span ids
- Metrics: run duration, cost, token usage, error rate
- Alerting: failed runs, webhook delivery failures

### Data Model (Hybrid Architecture)

**Convex Schema (Management Layer):**
- workflows: { id, workspaceId, name, version, nodes, edges, variables, createdAt }
- workspaces: { id, name, ownerId, plan, settings, createdAt }
- users: { id, email, workspaces[], role, createdAt }
- api_keys: { id, workspaceId, name, scopes, hashedKey, createdAt, lastUsedAt }
- webhooks: { id, workspaceId, url, secret, events[] }
- secrets: { id, workspaceId, key, encryptedValue }

**Inngest Schema (Execution Layer):**
- runs: { id, workflowId, workspaceId, status, input, output, cost, createdAt, updatedAt }
- steps: { id, runId, nodeId, status, input, output, tokens, cost, startedAt, finishedAt }
- events: { id, runId, type, data, timestamp }
- execution_logs: { id, runId, stepId, level, message, metadata, timestamp }

**Cross-Platform Synchronization:**
- Convex triggers Inngest workflows via API
- Inngest reports execution status back to Convex
- Real-time updates flow through Convex to UI
- Billing and usage data aggregated from both platforms

### Future Migration Considerations

**Current Hybrid Architecture Benefits:**
- **No Vendor Lock-in:** Both Convex and Inngest have export capabilities
- **Incremental Migration:** Can replace either layer independently
- **Best-in-Class:** Use each platform for what it does best

**Potential Future Paths:**
- **Full Inngest:** Migrate dashboard to Inngest if they add real-time UI features
- **Custom Infrastructure:** Replace Inngest with custom AWS/GCP if volume requires
- **Multi-Cloud:** Add additional execution providers for geographic distribution
- **Enterprise On-Premise:** Containerized deployment using Inngest Enterprise

### Cost Control

- Per-run budget caps; downgrade models on retry
- Batch provider calls where possible
- Cache step results for identical inputs (per workspace)

### Compliance & Enterprise Readiness (later)

- Audit logs for admin actions and secrets access
- Data residency and VPC peering for enterprise tiers
- BYO cloud/on-prem via containerized executor
