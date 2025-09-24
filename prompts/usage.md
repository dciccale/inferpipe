# inferpipe Usage Guide

## Backend Integration Patterns

### Core Philosophy

inferpipe follows the same backend-only integration pattern as Inngest - **no client-side SDKs or React hooks**. All integrations happen in your backend using API keys for authentication.

**Why Backend-Only:**
- **Security:** API keys stay server-side, never exposed to browsers
- **Simplicity:** Single integration pattern across all frameworks
- **Reliability:** Consistent execution environment and error handling
- **Scalability:** Backend-to-backend communication optimized for performance

---

## SDK Installation & Setup

### Installation

```bash
npm install @inferpipe/sdk
# or
yarn add @inferpipe/sdk
# or
pnpm add @inferpipe/sdk
```

### Basic Configuration

```typescript
import { InferPipe } from '@inferpipe/sdk';

const inferpipe = new InferPipe({
  apiKey: process.env.INFERPIPE_API_KEY,
  workspaceId: process.env.INFERPIPE_WORKSPACE_ID,
  // Optional: environment-specific endpoints
  baseUrl: process.env.INFERPIPE_BASE_URL || 'https://api.inferpipe.com'
});
```

---

## Core Usage Patterns

### Execution Methods: `execute` vs `executeAsync`

**Use `execute()` when:**
- You need the result immediately for further processing
- The workflow has a reasonable completion time (< 30 seconds)
- You're building synchronous APIs or user-facing features

**Use `executeAsync()` when:**
- Workflows take longer to complete (> 30 seconds)
- You want to avoid blocking your API response
- Results will be processed via webhook (configured in dashboard)
- You're doing "fire-and-forget" style processing

### Simple Workflow Execution

```typescript
// Execute a workflow and wait for completion
async function processUserContent(userId: string, content: string) {
  const result = await inferpipe.execute({
    workflowId: 'content-moderation',
    input: {
      userId,
      content,
      timestamp: new Date().toISOString()
    }
  });

  return result.data;
}
```

### Async Execution with Webhooks

```typescript
// Trigger workflow and handle completion via webhook
// Note: Webhook endpoints are configured in the inferpipe dashboard UI, not in code
async function generateMarketingCopy(productId: string) {
  const execution = await inferpipe.executeAsync({
    workflowId: 'marketing-copy-generator',
    input: { productId }
  });

  // Returns immediately with execution ID
  // Results will be delivered to your configured webhook endpoint
  return { executionId: execution.id, status: 'pending' };
}
```

### Streaming Responses

```typescript
// Handle streaming AI responses
async function streamChatResponse(messages: Message[]) {
  const stream = await inferpipe.executeStream({
    workflowId: 'chat-assistant',
    input: { messages }
  });

  // Process chunks as they arrive
  for await (const chunk of stream) {
    console.log('Chunk:', chunk.data);
    
    // Send to client via SSE, WebSocket, etc.
    sendToClient(chunk.data);
  }
}
```

---

## Framework Integration Examples

### Next.js API Routes

```typescript
// pages/api/analyze-sentiment.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { inferpipe } from '@/lib/inferpipe';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    const result = await inferpipe.execute({
      workflowId: 'sentiment-analysis',
      input: { text }
    });

    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
}
```

### Express.js Route

```typescript
// routes/workflows.js
import express from 'express';
import { inferpipe } from '../lib/inferpipe.js';

const router = express.Router();

router.post('/extract-data', async (req, res) => {
  try {
    const { document, schema } = req.body;
    
    const result = await inferpipe.execute({
      workflowId: 'data-extraction',
      input: { document, schema },
      timeout: 120000 // 2 minutes
    });

    res.json(result.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Extraction failed',
      details: error.message 
    });
  }
});

export default router;
```

### Fastify Plugin

```typescript
// plugins/inferpipe.ts
import fp from 'fastify-plugin';
import { InferPipe } from '@inferpipe/sdk';

export default fp(async function (fastify) {
  const inferpipe = new InferPipe({
    apiKey: process.env.INFERPIPE_API_KEY,
    workspaceId: process.env.INFERPIPE_WORKSPACE_ID
  });

  fastify.decorate('inferpipe', inferpipe);
});

// routes/ai.ts
fastify.post('/translate', async (request, reply) => {
  const { text, targetLanguage } = request.body;
  
  const result = await fastify.inferpipe.execute({
    workflowId: 'translation',
    input: { text, targetLanguage }
  });

  return result.data;
});
```

---

## Advanced Usage Patterns

### Batch Processing

```typescript
// Process multiple items with rate limiting
async function processDocumentsBatch(documents: Document[]) {
  const batchSize = 5;
  const results = [];

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    
    const batchPromises = batch.map(doc => 
      inferpipe.execute({
        workflowId: 'document-analysis',
        input: { document: doc.content, metadata: doc.metadata }
      })
    );

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
```

### Error Handling and Retries

```typescript
// Robust error handling with custom retry logic
async function reliableWorkflowExecution(workflowId: string, input: any) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await inferpipe.execute({
        workflowId,
        input,
        retryConfig: {
          attempts: 3,
          backoff: 'exponential',
          maxDelay: 30000
        }
      });

      return result;
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        throw new Error(`Workflow failed after ${maxRetries} attempts: ${error.message}`);
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### Background Job Integration

```typescript
// Bull/BullMQ integration
import { Queue, Worker } from 'bullmq';

const aiQueue = new Queue('ai-processing');

// Add job to queue for immediate processing
async function scheduleAIProcessing(data: any) {
  await aiQueue.add('process-content', {
    workflowId: 'content-enhancement',
    input: data
  });
}

// Process jobs with execute() for immediate results
const worker = new Worker('ai-processing', async (job) => {
  const { workflowId, input } = job.data;
  
  const result = await inferpipe.execute({
    workflowId,
    input
  });

  return result.data;
});

// Alternative: Use executeAsync() for long-running workflows
// Results will be delivered to your configured webhook endpoint
async function scheduleLongRunningAI(data: any) {
  const execution = await inferpipe.executeAsync({
    workflowId: 'document-analysis',
    input: data
  });
  
  // Store execution ID for tracking
  await saveExecutionId(execution.id);
}
```

---

## Webhook Handling

### Webhook Configuration

**Important:** Webhook endpoints are configured in the inferpipe dashboard UI, not in your code. This follows the same pattern as services like Clerk, Stripe, etc.

**To set up webhooks:**
1. Go to your inferpipe dashboard
2. Open your workflow
3. Navigate to the "Webhooks" or "Settings" tab
4. Add your webhook endpoint URL
5. Configure webhook secret for security
6. Select which events to receive

**In your code, simply use `executeAsync()`** - the webhook delivery is handled automatically based on your dashboard configuration.

### Webhook Security

```typescript
// Verify webhook signatures
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Handle webhook endpoint
app.post('/webhooks/inferpipe', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-inferpipe-signature'] as string;
  const payload = req.body.toString();
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(payload);
  
  switch (event.type) {
    case 'workflow.completed':
      handleWorkflowCompleted(event.data);
      break;
    case 'workflow.failed':
      handleWorkflowFailed(event.data);
      break;
  }

  res.status(200).send('OK');
});
```

### Event Processing

```typescript
// Handle different webhook events
async function handleWorkflowCompleted(data: any) {
  const { executionId, workflowId, output, metadata } = data;
  
  // Update database
  await db.executions.update(executionId, {
    status: 'completed',
    output,
    completedAt: new Date()
  });

  // Trigger downstream actions
  switch (workflowId) {
    case 'content-moderation':
      await publishContent(output.approved, output.contentId);
      break;
    case 'data-extraction':
      await processExtractedData(output.extractedData);
      break;
  }
}
```

---

## Monitoring and Observability

### Execution Tracking

```typescript
// Track execution metrics
class InferPipeMonitor {
  constructor(private inferpipe: InferPipe) {}

  async executeWithMetrics(workflowId: string, input: any) {
    const startTime = Date.now();
    
    try {
      const result = await this.inferpipe.execute({
        workflowId,
        input,
        metadata: {
          requestId: generateRequestId(),
          userId: getCurrentUserId(),
          source: 'api'
        }
      });

      const duration = Date.now() - startTime;
      this.recordMetrics('success', workflowId, duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetrics('error', workflowId, duration, error);
      throw error;
    }
  }

  private recordMetrics(status: string, workflowId: string, duration: number, error?: any) {
    // Send to your monitoring system
    console.log({
      status,
      workflowId,
      duration,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Health Checks

```typescript
// Health check endpoint
app.get('/health/inferpipe', async (req, res) => {
  try {
    const health = await inferpipe.health();
    res.json({
      status: 'healthy',
      inferpipe: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

---

## Configuration Management

### Environment-Based Configuration

```typescript
// config/inferpipe.ts
interface InferPipeConfig {
  apiKey: string;
  workspaceId: string;
  baseUrl: string;
  timeout: number;
  retries: number;
}

function getInferPipeConfig(): InferPipeConfig {
  const env = process.env.NODE_ENV || 'development';
  
  const config: Record<string, Partial<InferPipeConfig>> = {
    development: {
      baseUrl: 'https://dev-api.inferpipe.com',
      timeout: 60000,
      retries: 1
    },
    staging: {
      baseUrl: 'https://staging-api.inferpipe.com',
      timeout: 120000,
      retries: 2
    },
    production: {
      baseUrl: 'https://api.inferpipe.com',
      timeout: 180000,
      retries: 3
    }
  };

  return {
    apiKey: process.env.INFERPIPE_API_KEY!,
    workspaceId: process.env.INFERPIPE_WORKSPACE_ID!,
    ...config[env]
  };
}

export const inferpipe = new InferPipe(getInferPipeConfig());
```

### Workflow Configuration

```typescript
// Define workflow configurations
const WORKFLOW_CONFIGS = {
  'sentiment-analysis': {
    timeout: 30000,
    retries: 2,
    rateLimit: { requests: 100, window: 60000 }
  },
  'document-processing': {
    timeout: 180000,
    retries: 1,
    rateLimit: { requests: 10, window: 60000 }
  },
  'image-generation': {
    timeout: 300000,
    retries: 0,
    rateLimit: { requests: 5, window: 60000 }
  }
} as const;

// Use configuration
async function executeWorkflow(workflowId: keyof typeof WORKFLOW_CONFIGS, input: any) {
  const config = WORKFLOW_CONFIGS[workflowId];
  
  return await inferpipe.execute({
    workflowId,
    input,
    timeout: config.timeout,
    retryConfig: { attempts: config.retries }
  });
}
```

---

## Testing Strategies

### Unit Testing

```typescript
// Mock inferpipe for testing
import { jest } from '@jest/globals';

const mockInferPipe = {
  execute: jest.fn(),
  executeAsync: jest.fn(),
  executeStream: jest.fn()
};

jest.mock('@inferpipe/sdk', () => ({
  InferPipe: jest.fn(() => mockInferPipe)
}));

// Test with mocked responses
test('should process content successfully', async () => {
  mockInferPipe.execute.mockResolvedValue({
    data: { sentiment: 'positive', confidence: 0.95 }
  });

  const result = await processUserContent('user123', 'Great product!');
  
  expect(result).toEqual({
    sentiment: 'positive',
    confidence: 0.95
  });
});
```

### Integration Testing

```typescript
// Integration tests with test workflows
describe('inferpipe integration', () => {
  const testInferPipe = new InferPipe({
    apiKey: process.env.INFERPIPE_TEST_API_KEY,
    workspaceId: process.env.INFERPIPE_TEST_WORKSPACE_ID,
    baseUrl: 'https://test-api.inferpipe.com'
  });

  test('should execute test workflow', async () => {
    const result = await testInferPipe.execute({
      workflowId: 'test-echo',
      input: { message: 'hello world' }
    });

    expect(result.data.message).toBe('hello world');
  });
});
```

---

## Performance Optimization

### Connection Pooling

```typescript
// Reuse connections for better performance
const inferpipe = new InferPipe({
  apiKey: process.env.INFERPIPE_API_KEY,
  workspaceId: process.env.INFERPIPE_WORKSPACE_ID,
  httpOptions: {
    keepAlive: true,
    maxSockets: 50,
    timeout: 120000
  }
});
```

### Caching Strategies

```typescript
// Cache workflow results for identical inputs
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

async function cachedExecute(workflowId: string, input: any) {
  const cacheKey = `${workflowId}:${JSON.stringify(input)}`;
  
  let result = cache.get(cacheKey);
  if (result) {
    return result;
  }

  result = await inferpipe.execute({ workflowId, input });
  cache.set(cacheKey, result);
  
  return result;
}
```

---

## SDK API Reference

### Core Methods

```typescript
interface InferPipeSDK {
  // Synchronous execution (wait for completion)
  execute(options: ExecuteOptions): Promise<ExecutionResult>;
  
  // Asynchronous execution (immediate return)
  executeAsync(options: ExecuteAsyncOptions): Promise<ExecutionInfo>;
  
  // Streaming execution
  executeStream(options: ExecuteStreamOptions): AsyncIterable<StreamChunk>;
  
  // Get execution status
  getExecution(executionId: string): Promise<ExecutionStatus>;
  
  // Cancel execution
  cancelExecution(executionId: string): Promise<void>;
  
  // Health check
  health(): Promise<HealthStatus>;
}
```

### Type Definitions

```typescript
interface ExecuteOptions {
  workflowId: string;
  input: Record<string, any>;
  timeout?: number;
  retryConfig?: RetryConfig;
  metadata?: Record<string, any>;
}

interface ExecuteAsyncOptions {
  workflowId: string;
  input: Record<string, any>;
  metadata?: Record<string, any>;
  // Note: Webhook configuration is done in the dashboard UI, not here
}

interface ExecutionResult {
  id: string;
  status: 'completed' | 'failed';
  data?: any;
  error?: string;
  metadata: ExecutionMetadata;
}

interface RetryConfig {
  attempts: number;
  backoff?: 'fixed' | 'exponential';
  maxDelay?: number;
}
```

---

_This backend-only approach ensures security, simplicity, and scalability while providing the same ease of use that makes tools like Inngest so powerful for developers._
