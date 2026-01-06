import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new step for a run
export const createStep = mutation({
  args: {
    runId: v.id("runs"),
    nodeId: v.string(),
    nodeType: v.string(),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Verify the run exists and belongs to the user
    const run = await ctx.db.get(args.runId);
    if (!run) {
      throw new Error("Run not found");
    }

    if (run.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    const stepId = await ctx.db.insert("steps", {
      runId: args.runId,
      userId: identity.subject,
      nodeId: args.nodeId,
      nodeType: args.nodeType,
      status: "pending",
      input: args.input,
      startedAt: Date.now(),
    });

    return stepId;
  },
});

// Update step status and output
export const updateStep = mutation({
  args: {
    stepId: v.id("steps"),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    output: v.optional(v.any()),
    error: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        tokens: v.optional(
          v.object({
            input: v.optional(v.number()),
            output: v.optional(v.number()),
          }),
        ),
        cost: v.optional(v.number()),
        duration: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const { stepId, ...updates } = args;

    // Get existing step
    const existing = await ctx.db.get(stepId);
    if (!existing) {
      throw new Error("Step not found");
    }

    // Check if the step belongs to the authenticated user
    if (existing.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    const updateData = {
      ...updates,
      ...(updates.status === "completed" || updates.status === "failed"
        ? { completedAt: Date.now() }
        : {}),
    };

    await ctx.db.patch(stepId, updateData);
    return stepId;
  },
});

// Get steps for a run
export const getStepsByRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Verify the run exists and belongs to the user
    const run = await ctx.db.get(args.runId);
    if (!run) {
      throw new Error("Run not found");
    }

    if (run.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    return await ctx.db
      .query("steps")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .order("asc")
      .collect();
  },
});
