import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Create a new workflow
export const createWorkflow = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
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
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    const workflowId = await ctx.db.insert("workflows", {
      name: args.name,
      description: args.description,
      status: args.status || "draft",
      userId: identity.subject,
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
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) {
      return null;
    }

    // Check if the workflow belongs to the authenticated user
    if (workflow.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    return workflow;
  },
});

// Update an existing workflow
export const updateWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
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
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const { workflowId, ...updates } = args;

    // Get existing workflow
    const existing = await ctx.db.get(workflowId);
    if (!existing) {
      throw new Error("Workflow not found");
    }

    // Check if the workflow belongs to the authenticated user
    if (existing.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    // Update with new values
    await ctx.db.patch(workflowId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return workflowId;
  },
});

// List all workflows for the current user
export const listWorkflows = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("workflows")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Delete a workflow
export const deleteWorkflow = mutation({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Get existing workflow
    const existing = await ctx.db.get(args.workflowId);
    if (!existing) {
      throw new Error("Workflow not found");
    }

    // Check if the workflow belongs to the authenticated user
    if (existing.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.workflowId);
    return { success: true };
  },
});

interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

interface Workflow {
  nodes: WorkflowNode[];
  userId: string;
}

interface UserIdentity {
  subject: string;
}

// Execute a workflow - creates a run and executes it
export const executeWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    input: v.any(),
    stepId: v.optional(v.string()), // Optional: execute only a specific step
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Check if workflow exists
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    // Check if the workflow belongs to the authenticated user
    if (workflow.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    // Create a new run
    const runId = await ctx.db.insert("runs", {
      workflowId: args.workflowId,
      userId: identity.subject,
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

      let result: unknown;
      if (args.stepId) {
        // Execute only a specific step
        result = await executeStep(
          ctx,
          workflow as Workflow,
          runId as Id<"runs">,
          args.input as Record<string, unknown>,
          args.stepId,
          identity as UserIdentity
        );
      } else {
        // Execute the full workflow
        result = await executeFullWorkflow(ctx, workflow as Workflow, runId as Id<"runs">, args.input as Record<string, unknown>, identity as UserIdentity);
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
async function executeStep(
  ctx: any,
  workflow: Workflow,
  runId: Id<"runs">,
  input: Record<string, unknown>,
  targetStepId: string,
  identity: UserIdentity
) {
  const targetNode = workflow.nodes.find(
    (node: WorkflowNode) => node.id === targetStepId,
  );
  if (!targetNode) {
    throw new Error(`Step ${targetStepId} not found in workflow`);
  }

  const stepId = await ctx.db.insert("steps", {
    runId,
    userId: identity.subject,
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

    let result: { output: unknown; metadata?: Record<string, unknown> };
    if (targetNode.type === "ai") {
      result = await executeAINode(targetNode, input);
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
async function executeFullWorkflow(
  ctx: any,
  workflow: Workflow,
  runId: Id<"runs">,
  input: Record<string, unknown>,
  identity: UserIdentity
) {
  // For now, execute AI nodes sequentially (MVP approach)
  // TODO: Replace with Inngest for background execution and proper graph traversal
  // See inngest.ts for the planned implementation
  const aiNodes = workflow.nodes.filter((node: WorkflowNode) => node.type === "ai");

  if (aiNodes.length === 0) {
    return { message: "No executable nodes found in workflow" };
  }

  let currentInput = input;
  let finalOutput: unknown = null;

  for (const node of aiNodes) {
    const stepId = await ctx.db.insert("steps", {
      runId,
      userId: identity.subject,
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

      const result = await executeAINode(node, currentInput);

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

// Execute an AI node (moved from http.ts)
async function executeAINode(node: WorkflowNode, input: Record<string, unknown>) {
  // This will be moved to Inngest later, but for now keep it simple
  const prompt = node.data.prompt || "Hello, how can I help you today?";
  const model = node.data.model || "gpt-3.5-turbo";

  // Simple template replacement
  let processedPrompt = prompt;
  if (input) {
    Object.keys(input).forEach((key) => {
      processedPrompt = processedPrompt.replace(
        new RegExp(`{{${key}}}`, "g"),
        String(input[key]),
      );
    });
  }

  // For now, return a mock response
  // TODO: Integrate with OpenAI via Inngest
  const mockOutput = `Mock AI response for prompt: "${processedPrompt}" using model: ${model}`;

  return {
    output: mockOutput,
    metadata: {
      model,
      tokens: { input: 10, output: 20 },
      cost: 0.001,
    },
  };
}
