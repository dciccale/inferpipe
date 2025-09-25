import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new workflow
export const createWorkflow = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
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
