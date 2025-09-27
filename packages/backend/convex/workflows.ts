import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new workflow
export const createWorkflow = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
    nodes: v.optional(
      v.array(
        v.object({
          id: v.string(),
          type: v.string(),
          position: v.object({
            x: v.number(),
            y: v.number(),
          }),
          data: v.any(),
        }),
      ),
    ),
    edges: v.optional(
      v.array(
        v.object({
          id: v.string(),
          source: v.string(),
          target: v.string(),
          sourceHandle: v.optional(v.string()),
          targetHandle: v.optional(v.string()),
        }),
      ),
    ),
    variables: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.string(),
          defaultValue: v.optional(v.any()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const workflowId = await ctx.db.insert("workflows", {
      name: args.name,
      description: args.description,
      status: args.status || "draft",
      nodes: args.nodes || [],
      edges: args.edges || [],
      variables: args.variables,
      createdAt: now,
      updatedAt: now,
    });

    return workflowId;
  },
});

// Get a workflow by ID
export const getWorkflow = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workflowId);
  },
});

// Update an existing workflow
export const updateWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
    nodes: v.optional(
      v.array(
        v.object({
          id: v.string(),
          type: v.string(),
          position: v.object({
            x: v.number(),
            y: v.number(),
          }),
          data: v.any(),
        }),
      ),
    ),
    edges: v.optional(
      v.array(
        v.object({
          id: v.string(),
          source: v.string(),
          target: v.string(),
          sourceHandle: v.optional(v.string()),
          targetHandle: v.optional(v.string()),
        }),
      ),
    ),
    variables: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.string(),
          defaultValue: v.optional(v.any()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { workflowId, ...updates } = args;

    // Get existing workflow
    const existing = await ctx.db.get(workflowId);
    if (!existing) {
      throw new Error("Workflow not found");
    }

    // Update with new values
    await ctx.db.patch(workflowId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return workflowId;
  },
});

// List all workflows
export const listWorkflows = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("workflows").order("desc").collect();
  },
});

// Delete a workflow
export const deleteWorkflow = mutation({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.workflowId);
    return { success: true };
  },
});

// Execute a workflow - creates a run and executes it
export const executeWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    input: v.any(),
    stepId: v.optional(v.string()), // Optional: execute only a specific step
  },
  handler: async (ctx, args) => {
    // Check if workflow exists
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    // Create a new run
    const runId = await ctx.db.insert("runs", {
      workflowId: args.workflowId,
      status: "pending",
      input: args.input,
      metadata: {
        totalSteps: workflow.nodes.length,
        completedSteps: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    try {
      // Update run status to running
      await ctx.db.patch(runId, {
        status: "running",
        updatedAt: Date.now(),
      });

      let result;
      if (args.stepId) {
        // Execute only a specific step
        result = await executeStep(ctx, workflow, runId, args.input, args.stepId);
      } else {
        // Execute the full workflow
        result = await executeFullWorkflow(ctx, workflow, runId, args.input);
      }

      // Update run status to completed
      await ctx.db.patch(runId, {
        status: "completed",
        output: result,
        updatedAt: Date.now(),
      });

      return {
        runId,
        status: "completed",
        output: result,
      };

    } catch (error) {
      // Update run status to failed
      await ctx.db.patch(runId, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        updatedAt: Date.now(),
      });

      throw error;
    }
  },
});

// Execute a single step
async function executeStep(ctx: any, workflow: any, runId: any, input: any, targetStepId: string) {
  const targetNode = workflow.nodes.find((node: any) => node.id === targetStepId);
  if (!targetNode) {
    throw new Error(`Step ${targetStepId} not found in workflow`);
  }

  const stepId = await ctx.db.insert("steps", {
    runId,
    nodeId: targetNode.id,
    nodeType: targetNode.type,
    status: "pending",
    input: { ...input, ...targetNode.data },
    startedAt: Date.now(),
  });

  try {
    await ctx.db.patch(stepId, {
      status: "running",
    });

    let result;
    if (targetNode.type === "llm") {
      result = await executeLLMNode(targetNode, input);
    } else if (targetNode.type === "input") {
      result = { output: input };
    } else {
      throw new Error(`Unsupported node type: ${targetNode.type}`);
    }

    await ctx.db.patch(stepId, {
      status: "completed",
      output: result.output,
      metadata: result.metadata || {},
      completedAt: Date.now(),
    });

    return result.output;

  } catch (error) {
    await ctx.db.patch(stepId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      completedAt: Date.now(),
    });
    throw error;
  }
}

// Execute the full workflow
async function executeFullWorkflow(ctx: any, workflow: any, runId: any, input: any) {
  // For now, execute LLM nodes sequentially (MVP approach)
  // TODO: Replace with Inngest for background execution and proper graph traversal
  // See inngest.ts for the planned implementation
  const llmNodes = workflow.nodes.filter((node: any) => node.type === "llm");
  
  if (llmNodes.length === 0) {
    return { message: "No executable nodes found in workflow" };
  }

  let currentInput = input;
  let finalOutput = null;

  for (const node of llmNodes) {
    const stepId = await ctx.db.insert("steps", {
      runId,
      nodeId: node.id,
      nodeType: node.type,
      status: "pending",
      input: { ...currentInput, ...node.data },
      startedAt: Date.now(),
    });

    try {
      await ctx.db.patch(stepId, {
        status: "running",
      });

      const result = await executeLLMNode(node, currentInput);

      await ctx.db.patch(stepId, {
        status: "completed",
        output: result.output,
        metadata: result.metadata || {},
        completedAt: Date.now(),
      });

      // Use output as input for next step
      currentInput = { ...currentInput, previousOutput: result.output };
      finalOutput = result.output;

    } catch (error) {
      await ctx.db.patch(stepId, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: Date.now(),
      });
      throw error;
    }
  }

  return finalOutput;
}

// Execute an LLM node (moved from http.ts)
async function executeLLMNode(node: any, input: any) {
  // This will be moved to Inngest later, but for now keep it simple
  const prompt = node.data.prompt || "Hello, how can I help you today?";
  const model = node.data.model || "gpt-3.5-turbo";

  // Simple template replacement
  let processedPrompt = prompt;
  if (input) {
    Object.keys(input).forEach(key => {
      processedPrompt = processedPrompt.replace(
        new RegExp(`{{${key}}}`, 'g'), 
        String(input[key])
      );
    });
  }

  // For now, return a mock response
  // TODO: Integrate with OpenAI via Inngest
  const mockOutput = `Mock LLM response for prompt: "${processedPrompt}" using model: ${model}`;
  
  return {
    output: mockOutput,
    metadata: {
      model,
      tokens: { input: 10, output: 20 },
      cost: 0.001,
    },
  };
}
