import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { generateText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

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

    // Verify workflow exists
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    // Check if the workflow belongs to the authenticated user
    if (workflow.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    const now = Date.now();

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
      v.literal("failed"),
    ),
    output: v.optional(v.any()),
    error: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        totalSteps: v.optional(v.number()),
        completedSteps: v.optional(v.number()),
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

export const executeAIAction = action({
  args: {
    prompt: v.string(),
    model: v.string(),
    previousOutput: v.optional(v.any()),
    outputFormat: v.optional(v.union(v.literal("text"), v.literal("json"))),
    // Schema authored in the UI builder; stored as JSON description
    schema: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    let fullPrompt = args.prompt;
    if (args.previousOutput) {
      fullPrompt = `Context from previous step:\n${JSON.stringify(args.previousOutput, null, 2)}\n\n${args.prompt}`;
    }

    const format = args.outputFormat || "text";

    if (format === "json") {
      // Convert UI schema JSON to zod. Fallback to a simple default.
      type UiProp = {
        name: string;
        type: "STR" | "NUM" | "BOOL" | "ENUM" | "OBJ" | "ARR";
        description?: string;
        required?: boolean;
        properties?: UiProp[];
        enum?: string[];
        items?: UiProp;
      };

      const buildZodForProp = (prop: UiProp): z.ZodTypeAny => {
        switch (prop.type) {
          case "STR":
            return z.string();
          case "NUM":
            return z.number();
          case "BOOL":
            return z.boolean();
          case "ENUM": {
            const options = (Array.isArray(prop.enum) && prop.enum.length > 0
              ? prop.enum
              : ["A", "B"]) as [string, ...string[]];
            return z.enum(options);
          }
          case "ARR":
            return z.array(prop.items ? buildZodForProp(prop.items) : z.any());
          case "OBJ": {
            const childShape = (prop.properties || []).reduce(
              (acc: Record<string, z.ZodTypeAny>, p: UiProp) => {
                const child = buildZodForProp(p);
                acc[p.name] = p.required === false ? child.optional() : child;
                return acc;
              },
              {},
            );
            return z.object(childShape);
          }
          default:
            return z.any();
        }
      };

      const toZodObject = (props: UiProp[] | undefined) =>
        z.object(
          (props || []).reduce((acc: Record<string, z.ZodTypeAny>, p: UiProp) => {
            const t = buildZodForProp(p);
            acc[p.name] = p.required === false ? t.optional() : t;
            return acc;
          }, {}),
        );

      const schema = toZodObject((args.schema as { properties?: UiProp[] } | undefined)?.properties);

      const { object } = await generateObject({
        model: openai(args.model),
        prompt: fullPrompt,
        schema,
      });

      return {
        output_text: JSON.stringify(object),
        output_parsed: object,
        model: args.model,
        timestamp: Date.now(),
      };
    }

    // Default to plain text output
    const { text } = await generateText({
      model: openai(args.model),
      prompt: fullPrompt,
    });

    return {
      output_text: text,
      model: args.model,
      timestamp: Date.now(),
    };
  },
});
