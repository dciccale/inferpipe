## API Design

### Authentication

- Header: Authorization: Bearer <api_key>
- Versioning via header: X-Inferpipe-Version: 2025-09-01
- Idempotency: Idempotency-Key header on run creation

### Endpoints

- Create Run
  - POST /v1/workflows/{workflowId}/runs
  - Body: { input: any, webhook_url?: string, stream?: boolean }
  - Responses:
    - 200: for short runs with `stream=false`, body { runId, status: "completed", output }
    - 202: { runId, status: "pending" }
    - If `stream=true`: switch to SSE; events: progress, token, result, error
- Get Run
  - GET /v1/runs/{runId}
  - Body: { runId, status, output?, error?, cost, steps[] }
- List Runs
  - GET /v1/workflows/{workflowId}/runs?status=&limit=&cursor=
- Cancel Run
  - POST /v1/runs/{runId}/cancel
- API Keys
  - POST /v1/api-keys, GET /v1/api-keys, DELETE /v1/api-keys/{id}

### Errors

- JSON: { error: { code, message, details? } }
- Representative codes: invalid_input, unauthorized, rate_limited, not_found, run_failed

### Webhooks

- Event types: workflow.run.completed, workflow.run.failed
- Headers: X-Inferpipe-Signature (HMAC SHA-256), X-Inferpipe-Timestamp
- Body: { id, type, data: { runId, workflowId, status, input, output?, error?, metrics } }
- Retries: exponential backoff, up to 24h

### Streaming (SSE)

- Endpoint: POST /v1/workflows/{workflowId}/runs?stream=true
- Events: meta, step_started, token, step_completed, completed, error
- Keep-alive comment every 15s

### Rate Limits

- Default: 60 req/min per API key, burst 120
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After

### Example

- Request:
  - POST /v1/workflows/wf_123/runs
  - Headers: Authorization: Bearer sk_inferpipe_xxx, Idempotency-Key: abc-123
  - Body: { input: { text: "Draft a welcome email" }, webhook_url: "https://example.com/hook" }
- Response 202:
  - { runId: "run_456", status: "pending" }

### Backend SDKs (later)

- TypeScript/JS backend SDK with typed clients and streaming helpers
- Server-side only - no client-side/browser SDKs (similar to Inngest pattern)
- Python and Go based on OpenAPI spec

### Competition

https://openai.github.io/openai-agents-js/
https://platform.openai.com/docs/guides/agents
https://platform.openai.com/docs/guides/evals?api-mode=responses
