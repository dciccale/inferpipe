import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new run for a workflow
export const createRun = mutation({
  args: {
    workflowId: v.id("workflows"),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Verify workflow exists
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    // Check if the workflow belongs to the authenticated user
    if (workflow.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    const runId = await ctx.db.insert("runs", {
      workflowId: args.workflowId,
      userId: identity.subject,
      status: "pending",
      input: args.input,
      metadata: {
        totalSteps: workflow.nodes.length,
        completedSteps: 0,
      },
      createdAt: now,
      updatedAt: now,
    });

    return runId;
  },
});

// Get a run by ID
export const getRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const run = await ctx.db.get(args.runId);
    if (!run) {
      return null;
    }

    // Check if the run belongs to the authenticated user
    if (run.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    // Also get the steps for this run
    const steps = await ctx.db
      .query("steps")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();

    return {
      ...run,
      steps,
    };
  },
});

// Update run status
export const updateRunStatus = mutation({
  args: {
    runId: v.id("runs"),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    output: v.optional(v.any()),
    error: v.optional(v.string()),
    metadata: v.optional(v.object({
      totalSteps: v.optional(v.number()),
      completedSteps: v.optional(v.number()),
      cost: v.optional(v.number()),
      duration: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const { runId, ...updates } = args;

    // Get existing run
    const existing = await ctx.db.get(runId);
    if (!existing) {
      throw new Error("Run not found");
    }

    // Check if the run belongs to the authenticated user
    if (existing.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(runId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return runId;
  },
});

// List runs for a workflow
export const listRuns = query({
  args: {
    workflowId: v.id("workflows"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Verify workflow exists and belongs to user
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    if (workflow.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    const query = ctx.db
      .query("runs")
      .withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});
