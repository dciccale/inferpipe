# Workflow State Management Specification

## Introduction

This specification defines how state is managed and passed between nodes in a workflow within the Inferpipe application. The goal is to enable seamless execution of workflows, support debugging by allowing individual node execution, and provide a foundation for advanced features like variable interpolation and schema validation. Workflows consist of nodes such as InputNodes (providing initial data) and AINodes (using AI models via the Vercel AI SDK for processing).

The MVP focuses on simple sequential execution where the output of one node is directly used as input to the next, without complex variable handling. State is maintained locally in the browser (e.g., via React state in the WorkflowBuilder component) and is not persisted to the database, meaning it is lost on page refresh. Future iterations will expand on this for production use.

## Core Concepts

### Nodes and Execution

- **Nodes**: Represent steps in the workflow. Examples:
  - **InputNode**: Provides initial data (e.g., HTML text from a product detail page).
  - **AINode**: Executes AI tasks using the selected model (from options in `AINode.tsx`, e.g., OpenAI, Anthropic). Prompts are user-defined and can request structured JSON outputs.
- **Execution Modes**:
  - **Full Workflow**: Run all nodes sequentially from start to end.
  - **Step-by-Step (Debugging)**: Execute individual nodes or from a specific node onward, allowing QA of each step. This is a core feature for verifying outputs before proceeding.
- **AI Integration**: Use Vercel AI SDK for AINode execution. The model is selected via the node's options. For MVP, prompts are plain text; AI is instructed to output JSON (e.g., "Output as JSON: {\"title\": \"product title\", \"price\": 100.50}").

### State Management

- **Workflow State**: A global object tracking the execution history of the workflow. It is an array of step results, where each step corresponds to a node's output.
  - Structure:
    ```json
    {
      "workflowId": "unique-id",  // Optional, for future persistence
      "steps": [
        {
          "id": "node-unique-id",  // e.g., "input-1" or "ai-node-2"
          "step": 1,  // Sequential number (1-based)
          "input": { ... },  // Input data for this node (previous step's output or initial data)
          "output": { ... },  // Raw output from the node
          "error": null | string,  // Any execution errors
          "timestamp": "ISO-string"  // For debugging
        },
        // ... more steps
      ],
      "currentStep": 3  // Index of the last executed step (for resuming)
    }
    ```
  - **Local Storage**: Managed in React state (e.g., in `useWorkflowBuilder.tsx` hook). No database integration for MVP; users re-run steps if refreshed.
- **Passing Data Between Nodes**:
  - **MVP Approach**: Sequential chaining. The `output` of the previous step is appended directly to the input of the next node.
    - For InputNode: No previous, uses user-provided data (e.g., HTML text).
    - For AINode: Append previous output as context in the prompt. Example:
      - Prompt: "Extract product info from this HTML: [previous output HTML]. Output as JSON: {\"title\": \"...\", \"price\": ...}"
      - Next AINode: "Compare price [previous JSON output] with web search results. Output: {\"score\": 4, \"label\": \"good deal\"}"
    - This enables simple flows like: Input (HTML) → AI Extract (JSON) → AI Compare (Score).
  - **No Full Variable Dictionary in MVP**: Avoid complexity; just raw output passing. Outputs are expected to be JSON for easy appending/parsing.

### Standardized Output Format

- All node outputs are wrapped in a consistent envelope for homogeneity and easy aggregation:
  ```json
  {
    "id": "node-id",
    "step": number,
    "output": { ... }  // Actual node-specific output (e.g., extracted product JSON or score)
  }
  ```
- **Why?** Ensures uniform state structure. The inner `output` can be validated against user-defined schemas in future.
- **Parsing**: After execution, parse AI responses as JSON. For MVP, assume user prompts enforce JSON; handle errors gracefully (e.g., retry or display raw text).

## MVP Implementation Details

- **Execution Flow**:
  1. User builds workflow in `WorkflowBuilder.tsx` (drag/drop nodes, connect sequentially).
  2. Trigger execution: Button for "Run Full" or "Run Step [ID]".
  3. For each node:
     - Gather input: Previous step's `output` (or initial for first).
     - Execute: For AI, call Vercel AI SDK with selected model and augmented prompt.
     - Store result in state.
     - Update UI to show progress.
  4. Display results: In a side panel (next to builder) or below the canvas. Show step-by-step outputs, expandable JSON views, and errors.
- **UI Considerations**:
  - **Builder Integration**: Add execution controls to `WorkflowBuilder.tsx` (e.g., play button per node or global).
  - **Results Panel**: Collapsible sections per step, with input/output diffs. Use `reactflow` events to highlight executed nodes.
  - **Debugging**: "Run from Here" button on nodes; step back/forward navigation.
  - **Error Handling**: If a step fails, halt execution and highlight in UI.
- **Technical Setup**:
  - **Vercel AI SDK**: Integrate in backend (`packages/backend/convex/runs.ts` or new `execution.ts`). Expose via Convex actions/mutations for client calls.
  - **Model Selection**: Pull from AINode props/options.
  - **No Persistence**: All in client-side state; use `useState` or `useReducer` in hook.
  - **Example Workflow**:
    1. InputNode: HTML input → Output: {"html": "<div>Product...</div>"}
    2. AINode: Prompt "Extract from {previous.output.html}" → Output: {"title": "Widget", "price": 100.50}
    3. AINode: Prompt "Compare {previous.output} via search" → Output: {"score": 4, "label": "good deal"}
- **Assumptions**:
  - Workflows are linear (no branches) for MVP.
  - Web search in AI: Use tools in Vercel AI SDK if supported by model.

## Future Features

- **Schema Enforcement**:
  - User provides JSON schema in AINode (e.g., via textarea or editor).
  - Parse schema with Zod, pass to Vercel AI SDK's `generateObject` or similar for structured outputs.
  - Fallback: If no schema, parse raw JSON from prompt.
  - Integration: Store schema in node data; validate post-execution.
- **Variable Interpolation**:
  - **Syntax**: In prompts, use mustache-like templates: `{step1.output.price}` or `{prev.title}` (alias for previous step).
  - **Implementation**:
    - Global State: Aggregate all previous steps' outputs in a flat dictionary (e.g., `state.variables = { step1_title: "...", step2_score: 4 }`).
    - Parsing: Before execution, scan prompt for `{...}`, resolve against state (e.g., using a library like `mustache` or custom regex).
    - Edge Cases: Nested JSON (e.g., `{step1.output.details.specs.cpu}`), error if unresolved.
  - **UI Enhancements**:
    - **Custom Mini-Editor**: In AINode prompt editor, add autocomplete/suggestions for variables (e.g., dropdown of available `{stepX.field}`).
    - Use Monaco Editor or CodeMirror for syntax highlighting (variables in blue, errors in red).
    - Preview: Button to "Preview Prompt" showing resolved variables.
- **Advanced State**:
  - **Branches/Conditionals**: Support if/else nodes; state branches accordingly.
  - **Global Variables**: User-defined vars (e.g., API keys) outside steps.
  - **Persistence**: Save execution history to Convex DB; resume interrupted runs.
  - **Parallel Execution**: For independent nodes; aggregate outputs.
- **Output Enhancements**:
  - Always wrap in standard schema, even with user schemas inside `output`.
  - Streaming: Support AI streaming for long responses; update state incrementally.
- **Security/Validation**:
  - Sanitize inputs/outputs to prevent injection.
  - Rate limiting on AI calls via backend.
- **Monitoring**:
  - Logs: Detailed traces in state for each step.
  - Analytics: Track execution time, errors for UX improvements.

## Risks and Considerations

- **Complexity**: Variable interpolation requires robust parsing; start simple in MVP.
- **AI Reliability**: JSON parsing can fail; implement retries and fallbacks.
- **Performance**: Local state is fine for MVP; scale to DB for long workflows.
- **Dependencies**: Ensure Vercel AI SDK compatibility with selected models; add web search tools (e.g., Tavily integration).

This spec provides a roadmap from MVP to full-featured workflows, ensuring extensibility while delivering quick value.
