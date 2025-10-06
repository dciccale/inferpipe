## InferPipe Backend SDK — PRD

### Overview

Define a first-party backend SDK that lets developers execute visual workflows built in the InferPipe builder from server environments. The SDK should be ergonomic, type-safe, production-ready (auth, retries, idempotency, telemetry), while keeping the core API simple and consistent with the current docs page.

### Goals

- Provide a stable Node.js/TypeScript SDK with the following primitives:
  - execute: synchronous execution with result
  - executeAsync: fire-and-forget with webhook delivery
  - executeStream: incremental streaming responses
- Offer a clean configuration object for auth, base URL, timeouts, and hooks.
- Support typed inputs/outputs using zod and/or TypeScript generics.
- Deliver structured errors, tracing metadata, and request/response logging hooks.

### Non-Goals (Initial Version)

- Client-side/browser SDK (server-only for now).
- Full local emulator; we can provide a mock layer later.
- Workflow authoring in code; authoring happens in the visual builder. Code can only execute workflows; no events.

### Inspirations

- OpenAI “workflow/agent” runner patterns: typed outputs via schemas, run context, trace metadata.
- Inngest: developer experience for retries, idempotency, and background processing.

---

## API Surface

### Package

- Name: `@inferpipe/sdk`
- Runtime: Node.js LTS (>=18)

### Client

```ts
import { InferPipe } from "@inferpipe/sdk";

const inferpipe = new InferPipe({
  apiKey: process.env.INFERPIPE_API_KEY!,
  workspaceId: process.env.INFERPIPE_WORKSPACE_ID!,
  baseUrl: process.env.INFERPIPE_BASE_URL, // optional, defaults to cloud
  timeoutMs: 30_000,                        // optional
  headers: { "X-Custom": "..." },         // optional
  httpOptions: { keepAlive: true, maxSockets: 50 }, // optional
  // Optional hooks
  onRequest?: (req) => void,
  onResponse?: (res) => void,
  onError?: (err) => void,
});
```

### Installation

```bash
npm install @inferpipe/sdk
# or
yarn add @inferpipe/sdk
# or
pnpm add @inferpipe/sdk
```

### Core Types

```ts
export interface ExecuteOptions<Input = Record<string, unknown>> {
  workflowId: string; // slug or ID
  input: Input; // arbitrary JSON or typed
  timeoutMs?: number; // per-call override
  metadata?: Record<string, unknown>; // user-defined context
  idempotencyKey?: string; // optional idempotency
  retry?: {
    attempts: number;
    backoff?: "fixed" | "exponential";
    maxDelayMs?: number;
  };
  trace?: { parentId?: string; tags?: Record<string, string> };
}

export interface ExecutionInfo {
  id: string; // execution id
  status: "queued" | "running" | "completed" | "failed";
  createdAt: string;
}

export interface ExecutionResult<Output = unknown> {
  id: string; // execution id
  status: "completed";
  data: Output; // result payload
  durationMs?: number;
  cost?: { tokens?: number; usd?: number };
  trace?: { id: string; url?: string }; // link to trace in dashboard
}

export interface StreamChunk {
  type: "log" | "token" | "data" | "error" | "done";
  timestamp: string;
  payload?: unknown;
}

export interface InferPipeError extends Error {
  name: "InferPipeError";
  code: string; // e.g. "UNAUTHORIZED", "NOT_FOUND", "RATE_LIMITED"
  status?: number; // HTTP status
  requestId?: string; // server-assigned for support/debug
  executionId?: string; // if execution already exists
  cause?: unknown;
}

export interface ExecutionStatus<Output = unknown> {
  id: string;
  status: "queued" | "running" | "completed" | "failed" | "canceled";
  data?: Output;
  error?: { code?: string; message: string };
  createdAt?: string;
  startedAt?: string;
  updatedAt?: string;
}

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  version?: string;
  time?: string;
}
```

### Methods

```ts
class InferPipe {
  constructor(config: InferPipeConfig);

  execute<Input, Output = unknown>(
    options: ExecuteOptions<Input>
  ): Promise<ExecutionResult<Output>>;

  executeAsync<Input>(options: ExecuteOptions<Input>): Promise<ExecutionInfo>;

  executeStream<Input>(
    options: ExecuteOptions<Input>
  ): AsyncIterable<StreamChunk>;

  // Optional server helpers (webhook verification)
  webhooks: {
    verify: (
      payload: string | Buffer,
      signature: string
    ) => { valid: boolean; timestamp: number };
  };

  // Execution management
  getExecution<Output = unknown>(
    executionId: string
  ): Promise<ExecutionStatus<Output>>;
  cancelExecution(executionId: string): Promise<void>;

  // Health
  health(): Promise<HealthStatus>;
}
```

---

## Webhooks

- Async executions deliver results to a configured webhook endpoint.
- We provide signature verification using `INFERPIPE_WEBHOOK_SECRET`.

```ts
// Next.js App Router route example
import { headers } from "next/headers";
import { InferPipe } from "@inferpipe/sdk";

const inferpipe = new InferPipe({
  apiKey: process.env.INFERPIPE_API_KEY!,
  workspaceId: process.env.INFERPIPE_WORKSPACE_ID!,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("x-inferpipe-signature") ?? "";
  const { valid } = inferpipe.webhooks.verify(body, signature);
  if (!valid) return new Response("Invalid signature", { status: 400 });

  const event = JSON.parse(body);
  // handle event.data / event.executionId / event.status
  return new Response("ok");
}
```

---

## Type Safety with zod (Optional)

Developers can bring their own schemas to validate inputs/outputs at the edge of their application. The SDK does not require zod but examples use it.

```ts
import { z } from "zod";

const OutputSchema = z.object({
  date: z.object({ name: z.string(), number: z.string() }),
  events: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      time: z.string(),
      color: z.string(),
      isNew: z.boolean(),
    })
  ),
});

type Output = z.infer<typeof OutputSchema>;

const result = await inferpipe.execute<{ input_as_text: string }, Output>({
  workflowId: "calendar-classifier",
  input: { input_as_text: "classify: meeting at 10am" },
});

const parsed = OutputSchema.parse(result.data);
```

---

## Usage Examples

### 1) Synchronous execution

```ts
const result = await inferpipe.execute<{ topic: string }, { outline: string }>({
  workflowId: "content-generation",
  input: { topic: "AI automation" },
  retry: { attempts: 2, backoff: "exponential", maxDelayMs: 8000 },
});

console.log(result.data.outline);
```

### 2) Async execution + webhook

```ts
const exec = await inferpipe.executeAsync({
  workflowId: "document-analysis",
  input: { documentUrl: "https://example.com/doc.pdf" },
  metadata: { customerId: "cus_123" },
});

console.log("Execution ID:", exec.id);
// Later, webhook receives the completion payload
```

### 3) Streaming

```ts
for await (const chunk of inferpipe.executeStream({
  workflowId: "chat-assist",
  input: { prompt: "Explain vector databases" },
})) {
  if (chunk.type === "token") process.stdout.write(String(chunk.payload));
}
```

### 4) Express route

```ts
import express from "express";
import { InferPipe } from "@inferpipe/sdk";

const app = express();
app.use(express.json());

const inferpipe = new InferPipe({
  apiKey: process.env.INFERPIPE_API_KEY!,
  workspaceId: process.env.INFERPIPE_WORKSPACE_ID!,
});

app.post("/analyze", async (req, res) => {
  try {
    const result = await inferpipe.execute({
      workflowId: "sentiment-analysis",
      input: { text: req.body.text },
    });
    res.json(result.data);
  } catch (err) {
    const e = err as InferPipeError;
    res
      .status(e.status ?? 500)
      .json({ code: e.code, message: e.message, requestId: e.requestId });
  }
});
```

---

## Framework Integration

### Next.js API Route

```ts
// pages/api/analyze-sentiment.ts
import { NextApiRequest, NextApiResponse } from "next";
import { InferPipe } from "@inferpipe/sdk";

const inferpipe = new InferPipe({
  apiKey: process.env.INFERPIPE_API_KEY!,
  workspaceId: process.env.INFERPIPE_WORKSPACE_ID!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body as { text: string };

    const result = await inferpipe.execute({
      workflowId: "sentiment-analysis",
      input: { text },
    });

    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ error: "Analysis failed" });
  }
}
```

### Fastify Plugin

```ts
// plugins/inferpipe.ts
import fp from "fastify-plugin";
import { InferPipe } from "@inferpipe/sdk";

export default fp(async function (fastify) {
  const inferpipe = new InferPipe({
    apiKey: process.env.INFERPIPE_API_KEY!,
    workspaceId: process.env.INFERPIPE_WORKSPACE_ID!,
  });

  fastify.decorate("inferpipe", inferpipe);
});

// routes/ai.ts
fastify.post("/translate", async (request, reply) => {
  const { text, targetLanguage } = request.body as {
    text: string;
    targetLanguage: string;
  };

  const result = await fastify.inferpipe.execute({
    workflowId: "translation",
    input: { text, targetLanguage },
  });

  return result.data;
});
```

---

## Advanced Usage

### Batch Processing

```ts
// Process multiple items with simple concurrency
async function processDocumentsBatch(
  documents: Array<{ content: string; metadata?: unknown }>
) {
  const batchSize = 5;
  const results: Array<PromiseSettledResult<unknown>> = [] as unknown as Array<
    PromiseSettledResult<unknown>
  >;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);

    const batchPromises = batch.map((doc) =>
      inferpipe.execute({
        workflowId: "document-analysis",
        input: { document: doc.content, metadata: doc.metadata },
      })
    );

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
```

### Error Handling and Retries

```ts
// Robust error handling with custom retry logic
async function reliableWorkflowExecution(workflowId: string, input: unknown) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await inferpipe.execute({
        workflowId,
        input,
        retry: {
          attempts: 3,
          backoff: "exponential",
          maxDelayMs: 30_000,
        },
      });

      return result;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw new Error(
          `Workflow failed after ${maxRetries} attempts: ${(error as Error).message}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### Background Job Integration (BullMQ)

```ts
import { Queue, Worker } from "bullmq";

const aiQueue = new Queue("ai-processing");

// Add job to queue for immediate processing
async function scheduleAIProcessing(data: unknown) {
  await aiQueue.add("process-content", {
    workflowId: "content-enhancement",
    input: data,
  });
}

// Process jobs with execute() for immediate results
const worker = new Worker("ai-processing", async (job) => {
  const { workflowId, input } = job.data as {
    workflowId: string;
    input: unknown;
  };

  const result = await inferpipe.execute({
    workflowId,
    input,
  });

  return result.data;
});

// Alternative: Use executeAsync() for long-running workflows
async function scheduleLongRunningAI(data: unknown) {
  const execution = await inferpipe.executeAsync({
    workflowId: "document-analysis",
    input: data,
  });
  await saveExecutionId(execution.id);
}
```

---

## Error Model

- All public methods throw `InferPipeError` on failure.
- Errors include `code`, `status`, `requestId`, and `executionId` when available.
- Common codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `INVALID_INPUT`, `RATE_LIMITED`, `TIMEOUT`, `SERVER_ERROR`.
- Retries: SDK performs client-side retries for idempotent requests when configured via `retry`.

---

## Transport & Performance

- HTTP over TLS with JSON payloads. Streaming via chunked transfer / server-sent events.
- Default timeout: 30s (configurable per client and per request).
- Automatic compression where supported.
- Optional `idempotencyKey` ensures safe retries for `execute` and `executeAsync`.

---

## Telemetry & Tracing

- Requests include `x-inferpipe-trace` metadata; responses return trace identifiers.
- Provide a `traceparent` passthrough for W3C distributed tracing.
- Hooks: `onRequest`, `onResponse`, `onError` for custom logging/APM.

---

## Security & Auth

- API Key via `Authorization: Bearer <key>`.
- Webhook signature verification using shared secret and HMAC.
- Recommend keeping keys server-side only; rotate regularly.

---

## Versioning & Compatibility

- Semantic versioning for the SDK (`MAJOR.MINOR.PATCH`).
- Backwards-compatible additions to response payloads allowed.
- Breaking changes gated behind major versions.

---

## Testing Guidance

- Provide a lightweight `MockInferPipe` utility for unit tests.
- Recommend using the dashboard test environment for integration tests.

### Unit Testing (Jest Mock)

```ts
import { jest } from "@jest/globals";

const mockInferPipe = {
  execute: jest.fn(),
  executeAsync: jest.fn(),
  executeStream: jest.fn(),
  getExecution: jest.fn(),
};

jest.mock("@inferpipe/sdk", () => ({
  InferPipe: jest.fn(() => mockInferPipe),
}));

test("should process content successfully", async () => {
  mockInferPipe.execute.mockResolvedValue({
    data: { sentiment: "positive", confidence: 0.95 },
  });

  const result = await processUserContent("user123", "Great product!");
  expect(result).toEqual({ sentiment: "positive", confidence: 0.95 });
});
```

### Integration Testing

```ts
const testInferPipe = new InferPipe({
  apiKey: process.env.INFERPIPE_TEST_API_KEY!,
  workspaceId: process.env.INFERPIPE_TEST_WORKSPACE_ID!,
  baseUrl: "https://test-api.inferpipe.com",
});

test("should execute test workflow", async () => {
  const result = await testInferPipe.execute({
    workflowId: "test-echo",
    input: { message: "hello world" },
  });
  expect((result as any).data.message).toBe("hello world");
});
```

---

## Monitoring and Observability

### Execution Tracking Wrapper

```ts
class InferPipeMonitor {
  constructor(private inferpipe: InferPipe) {}

  async executeWithMetrics(workflowId: string, input: unknown) {
    const startTime = Date.now();

    try {
      const result = await this.inferpipe.execute({
        workflowId,
        input,
        metadata: {
          requestId: crypto.randomUUID(),
          source: "api",
        },
      });

      const duration = Date.now() - startTime;
      this.recordMetrics("success", workflowId, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetrics("error", workflowId, duration, error);
      throw error;
    }
  }

  private recordMetrics(
    status: string,
    workflowId: string,
    duration: number,
    error?: unknown
  ) {
    console.log({
      status,
      workflowId,
      duration,
      error: (error as Error)?.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Health Checks

```ts
// Health check endpoint
app.get("/health/inferpipe", async (req, res) => {
  try {
    const health = await inferpipe.health();
    res.json({
      status: "healthy",
      inferpipe: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});
```

---

## Configuration Management

### Environment-Based Configuration

```ts
interface InferPipeEnvConfig {
  apiKey: string;
  workspaceId: string;
  baseUrl: string;
  timeoutMs: number;
  retries: number;
}

function getInferPipeConfig(): InferPipeEnvConfig {
  const env = process.env.NODE_ENV || "development";

  const config: Record<string, Partial<InferPipeEnvConfig>> = {
    development: {
      baseUrl: "https://dev-api.inferpipe.com",
      timeoutMs: 60_000,
      retries: 1,
    },
    staging: {
      baseUrl: "https://staging-api.inferpipe.com",
      timeoutMs: 120_000,
      retries: 2,
    },
    production: {
      baseUrl: "https://api.inferpipe.com",
      timeoutMs: 180_000,
      retries: 3,
    },
  };

  return {
    apiKey: process.env.INFERPIPE_API_KEY!,
    workspaceId: process.env.INFERPIPE_WORKSPACE_ID!,
    ...(config[env] as InferPipeEnvConfig),
  };
}

export const inferpipeFromEnv = new InferPipe(getInferPipeConfig());
```

### Workflow Configuration

```ts
const WORKFLOW_CONFIGS = {
  "sentiment-analysis": { timeoutMs: 30_000, retries: 2 },
  "document-processing": { timeoutMs: 180_000, retries: 1 },
  "image-generation": { timeoutMs: 300_000, retries: 0 },
} as const;

async function executeWorkflow(
  workflowId: keyof typeof WORKFLOW_CONFIGS,
  input: unknown
) {
  const config = WORKFLOW_CONFIGS[workflowId];
  return await inferpipe.execute({
    workflowId,
    input,
    timeoutMs: config.timeoutMs,
    retry: { attempts: config.retries },
  });
}
```

---

## Performance Optimization

### Connection Pooling

```ts
const inferpipe = new InferPipe({
  apiKey: process.env.INFERPIPE_API_KEY!,
  workspaceId: process.env.INFERPIPE_WORKSPACE_ID!,
  httpOptions: { keepAlive: true, maxSockets: 50, timeout: 120_000 },
});
```

### Caching

```ts
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 });

async function cachedExecute(workflowId: string, input: unknown) {
  const cacheKey = `${workflowId}:${JSON.stringify(input)}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit as unknown;

  const result = await inferpipe.execute({ workflowId, input });
  cache.set(cacheKey, result);
  return result;
}
```

---

## Open Questions

- How much typed validation should the SDK enforce locally versus relying on server-side validation?
- Should we add client-side helpers for common patterns like backoff/retry observers?

---

## Milestones

- v0: Private preview, Node.js only, execute/async/stream, webhooks verify.
- v1: Public, improved error model, idempotency, retries, execution management (get/cancel), health.
- v1.x: Streaming improvements, client hooks, tracing passthrough, test utilities.
- v2: Additional languages (Python).
