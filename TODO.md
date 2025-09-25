# Inferpipe MVP TODO List

## Phase 1: Minimal Workflow Builder Implementation

### 1. Backend Setup (Convex)
- [ ] **Set up minimal Convex schema for workflows, runs, and steps**
  - Create `schema.ts` with workflows, runs, steps tables
  - Define workflow structure (nodes, edges, variables)
  - Set up basic user/workspace structure
  
- [ ] **Create Convex mutations and queries for workflow CRUD operations**
  - `createWorkflow` mutation
  - `getWorkflow` query  
  - `updateWorkflow` mutation
  - `listWorkflows` query

- [ ] **Create Convex HTTP actions for API endpoints**
  - POST `/v1/workflows/{id}/runs` - execute workflow
  - GET `/v1/runs/{id}` - get run status
  - Implement basic authentication (API key header)
  - Return proper HTTP status codes (200, 202, 404, etc.)

### 2. Frontend Dependencies & Setup
- [ ] **Install React Flow, shadcn/ui, and other frontend dependencies**
  - @xyflow/react for workflow canvas
  - shadcn/ui components (button, input, card, etc.)
  - lucide-react for icons
  - zustand for state management
  - react-hook-form + zod for forms

### 3. Workflow Builder UI
- [ ] **Build React Flow based workflow builder in page.tsx**
  - Basic canvas with pan/zoom/grid
  - Node palette (start with just LLM node)
  - Simple toolbar with save/run buttons
  - Connect to Convex for persistence

- [ ] **Create LLM node component with prompt input and model selection**
  - Custom node with textarea for prompt
  - Dropdown for model selection (gpt-4, claude-3, etc.)
  - Input/output handles for connections
  - Basic validation (required fields)

### 4. Workflow Execution
- [ ] **Implement workflow execution logic for single LLM step**
  - Execute LLM API calls (OpenAI/Anthropic)
  - Store execution results in Convex
  - Handle errors gracefully
  - Return structured response

- [ ] **Test end-to-end workflow**
  - Create workflow with single LLM node
  - Set prompt and model
  - Execute via API endpoint
  - Verify results stored and returned

## Technical Specifications

### Convex Schema (Minimal)
```typescript
// workflows table
{
  id: string,
  name: string,
  nodes: Array<{id, type, position, data}>,
  edges: Array<{id, source, target}>,
  createdAt: number
}

// runs table  
{
  id: string,
  workflowId: string,
  status: "pending" | "running" | "completed" | "failed",
  input: any,
  output?: any,
  error?: string,
  createdAt: number
}

// steps table
{
  id: string,
  runId: string,
  nodeId: string,
  status: "pending" | "running" | "completed" | "failed", 
  input: any,
  output?: any,
  error?: string,
  startedAt?: number,
  completedAt?: number
}
```

### API Endpoints
- `POST /v1/workflows/{workflowId}/runs` 
  - Body: `{input: any}`
  - Returns: `{runId, status, output?}`
- `GET /v1/runs/{runId}`
  - Returns: `{runId, status, output?, error?}`

### Node Types (MVP)
- **LLM Node**: prompt template + model selection → text output
- **Input Node**: workflow entry point  
- **Output Node**: workflow result

### Frontend Stack
- Next.js 14 with TypeScript
- React Flow for workflow canvas
- shadcn/ui for components
- Convex for backend integration
- Zustand for state management

## Success Criteria
✅ User can create a workflow with a single LLM node
✅ User can set prompt and model in the node
✅ User can execute the workflow via API
✅ Execution results are stored and returned
✅ Basic error handling is in place
