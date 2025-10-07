import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { v } from "convex/values";
import OpenAI from "openai";
import { z } from "zod";
import { action, mutation, query } from "./_generated/server";

// Some OpenAI models (e.g. gpt-4o-search-preview) require Chat Completions
const requiresChatCompletions = (model: string) => {
  const m = model.toLowerCase();
  if (m.includes("search")) return true;
  // Extend here for any other known chat-only models
  return false;
};

type WebSearchOptions = Record<string, unknown>;

const tryParseJson = (content: string): unknown | null => {
  try {
    return JSON.parse(content);
  } catch {}

  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }

  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const slice = content.slice(start, end + 1);
    try {
      return JSON.parse(slice);
    } catch {}
  }

  return null;
};

const useOpenAIChatCompletionsJson = async (
  model: string,
  prompt: string,
  schema: z.ZodTypeAny,
  searchOptions?: WebSearchOptions,
) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const usingSearch = !!searchOptions && Object.keys(searchOptions).length > 0;
  const isSearchModel = requiresChatCompletions(model);
  const completion = await client.chat.completions.create({
    model,
    ...(usingSearch ? { web_search_options: searchOptions } : {}),
    ...(!isSearchModel && !usingSearch
      ? { response_format: { type: "json_object" } }
      : {}),
    messages: [
      {
        role: "user",
        content: `${prompt}\n\nReturn ONLY valid JSON that matches the expected structure. Do not include markdown or extra text.`,
      },
    ],
  });
  const content = completion.choices?.[0]?.message?.content ?? "{}";
  const parsedCandidate = tryParseJson(content);
  const parsed = parsedCandidate === null ? { raw: content } : parsedCandidate;
  const result = schema.safeParse(parsed);
  return result.success ? result.data : parsed;
};

const useOpenAIChatCompletionsText = async (
  model: string,
  prompt: string,
  searchOptions?: WebSearchOptions,
) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model,
    ...(searchOptions ? { web_search_options: searchOptions } : {}),
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  return completion.choices?.[0]?.message?.content ?? "";
};

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
      const options = (
        Array.isArray(prop.enum) && prop.enum.length > 0
          ? prop.enum
          : ["A", "B"]
      ) as [string, ...string[]];
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

export const executeAIAction = action({
  args: {
    prompt: v.string(),
    model: v.string(),
    previousOutput: v.optional(v.any()),
    outputFormat: v.optional(v.union(v.literal("text"), v.literal("json"))),
    // Schema authored in the UI builder; stored as JSON description
    schema: v.optional(v.any()),
    // Optional OpenAI web search options when using chat completions search models
    searchOptions: v.optional(v.any()),
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
      const schema = toZodObject(
        (args.schema as { properties?: UiProp[] } | undefined)?.properties,
      );

      // Route known chat-completions-only models through the OpenAI client
      if (requiresChatCompletions(args.model)) {
        const object = await useOpenAIChatCompletionsJson(
          args.model,
          fullPrompt,
          schema,
          args.searchOptions as WebSearchOptions | undefined,
        );

        return {
          output_text: JSON.stringify(object),
          output_parsed: object,
          model: args.model,
          timestamp: Date.now(),
        };
      }

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
    // Route known chat-completions-only models through the OpenAI client
    if (requiresChatCompletions(args.model)) {
      const text = await useOpenAIChatCompletionsText(
        args.model,
        fullPrompt,
        args.searchOptions as WebSearchOptions | undefined,
      );

      return {
        output_text: text,
        model: args.model,
        timestamp: Date.now(),
      };
    }

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
