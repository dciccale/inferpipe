// Inngest integration for background workflow execution
// This file will contain the Inngest functions for executing workflows and steps
// Unused yet, as Inngest setup is pending

import { v } from "convex/values";
import { action } from "./_generated/server";

// TODO: Install and configure Inngest SDK if serving functions from our code
// npm install inngest

const INNGEST_API_BASE = process.env.INNGEST_API_BASE ?? "https://api.inngest.com";
const INNGEST_API_KEY = process.env.INNGEST_API_KEY ?? "";

// Optional flag to use the SDK for sending events. Falls back to HTTP API if false.
const USE_INNGEST_SDK = false;

// Types representing our workflow graph persisted by the builder
export type WorkflowNodeType = "llm" | "transform";

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  // Arbitrary config per node type
  config: Record<string, unknown> & {
    model?: string; // for llm
    prompt?: string; // for llm
    script?: string; // for transform
  };
}

export interface WorkflowGraph {
  topologicallySortedNodes: WorkflowNode[];
  outputNodeId: string;
}

function labelForStep(node: WorkflowNode): string {
  return `node-${node.id}-${node.type}`;
}

function renderPromptTemplate(
  template: string | undefined,
  initialInput: unknown,
  nodeIdToResult: Record<string, unknown>
): string {
  if (!template) return "";
  // Very basic template replacement for MVP.
  // Replace {{input.*}} and {{node.<id>.*}} tokens with JSON values.
  return template
    .replaceAll("{{input}}", JSON.stringify(initialInput))
    .replaceAll("{{results}}", JSON.stringify(nodeIdToResult));
}

async function inngestApi(path: string, init?: RequestInit) {
  const res = await fetch(`${INNGEST_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${INNGEST_API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Inngest API ${path} failed: ${res.status} ${text}`);
  }
  return res;
}

// Trigger a workflow execution in Inngest by sending an event
export const triggerInngestRun = action({
  args: {
    workspaceId: v.string(),
    workflowVersionId: v.string(),
    runId: v.string(),
    graph: v.any(),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    if (USE_INNGEST_SDK) {
      // Optional: use the SDK for sending events
      const { Inngest } = await import("inngest");
      const client = new Inngest({ id: "inferpipe" });
      await client.send({
        name: "inferpipe/workflow.execute",
        data: {
          runId: args.runId,
          workspaceId: args.workspaceId,
          workflowVersionId: args.workflowVersionId,
          graph: args.graph as WorkflowGraph,
          input: args.input,
        },
      });
    } else {
      // Default: use Cloud API directly
      await inngestApi(`/v1/events`, {
        method: "POST",
        body: JSON.stringify({
          name: "inferpipe/workflow.execute",
          data: {
            runId: args.runId,
            workspaceId: args.workspaceId,
            workflowVersionId: args.workflowVersionId,
            graph: args.graph as WorkflowGraph,
            input: args.input,
          },
        }),
      });
    }

    return { runId: args.runId };
  },
});

// Compile a workflow from our store and trigger a run
export const compileAndTrigger = action({
  args: {
    workspaceId: v.string(),
    workflowId: v.string(),
    workflowVersionId: v.string(),
    runId: v.string(),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    // TODO: Fetch workflow graph by (workspaceId, workflowId, workflowVersionId) from Convex store
    // const graph = await ctx.runQuery(api.workflows.getVersionGraph, {...})
    const graph: WorkflowGraph = {
      topologicallySortedNodes: [
        { id: "n1", type: "llm", config: { model: "gpt-4", prompt: "Summarize: {{input}}" } },
        { id: "n2", type: "transform", config: { script: "return { summary: results['n1'] }" } },
      ],
      outputNodeId: "n2",
    };

    return await triggerInngestRun.handler(ctx as any, {
      workspaceId: args.workspaceId,
      workflowVersionId: args.workflowVersionId,
      runId: args.runId,
      graph,
      input: args.input,
    });
  },
});

// Fetch run status for observability pages
export const getInngestRun = action({
  args: { runId: v.string() },
  handler: async (ctx, args) => {
    const res = await inngestApi(`/v1/runs/${args.runId}`);
    const json = await res.json();
    return json;
  },
});

// Fetch jobs (steps) for a given run and map them to our step model
export const getInngestRunJobs = action({
  args: { runId: v.string() },
  handler: async (ctx, args) => {
    const res = await inngestApi(`/v1/runs/${args.runId}/jobs`);
    const json = await res.json();

    // Map to a simple UI-friendly structure
    const jobs = Array.isArray(json?.data) ? json.data : [];
    const mapped = jobs.map((job: any) => ({
      id: job.id,
      name: job.name, // should be our labelForStep(...)
      status: job.status,
      startedAt: job.startedAt ?? job.started_at,
      finishedAt: job.finishedAt ?? job.finished_at,
      durationMs: job.durationMs ?? job.duration_ms,
      outputPreview: job.output ?? job.result ?? null,
      error: job.error ?? null,
    }));

    return { runId: args.runId, steps: mapped };
  },
});

// Cancel a running execution
export const cancelInngestRun = action({
  args: { runId: v.string() },
  handler: async (ctx, args) => {
    await inngestApi(`/v1/runs/${args.runId}`, { method: "DELETE" });
    return { canceled: true };
  },
});

// Example Inngest setup (server runtime) — retained for reference only
/*
import { Inngest } from "inngest";
import { serve } from "inngest/convex";

const inngest = new Inngest({ id: "inferpipe" });

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "inferpipe/workflow.execute" },
  async ({ event, step }) => {
    const { runId, workspaceId, workflowVersionId, graph, input } = event.data as {
      runId: string;
      workspaceId: string;
      workflowVersionId: string;
      graph: WorkflowGraph;
      input: unknown;
    };

    const nodeIdToResult: Record<string, unknown> = {};

    for (const node of graph.topologicallySortedNodes) {
      if (node.type === "llm") {
        const result = await step.run(labelForStep(node), async () => {
          const prompt = renderPromptTemplate(node.config.prompt as string, input, nodeIdToResult);
          // Placeholder: call provider
          return await callLLM({ model: node.config.model as string, prompt });
        });
        nodeIdToResult[node.id] = result;
      } else if (node.type === "transform") {
        const result = await step.run(labelForStep(node), async () => {
          return transformData(node.config.script as string, nodeIdToResult);
        });
        nodeIdToResult[node.id] = result;
      }
    }

    const finalOutput = nodeIdToResult[graph.outputNodeId];
    return { runId, output: finalOutput };
  }
);

export default serve({
  client: inngest,
  functions: [executeWorkflow],
});

// Example placeholders for provider calls used in the orchestrator
async function callLLM(args: { model: string; prompt: string }) {
  // TODO: Implement provider integration (OpenAI, etc.)
  return { output: `LLM(${args.model}): ${args.prompt}`, tokens: 123, cost: 0.0012 };
}

function transformData(script: string, nodeIdToResult: Record<string, unknown>) {
  // Very naive sandbox: DO NOT use eval in production. Replace with safe DSL.
  // eslint-disable-next-line no-new-func
  const fn = new Function("results", script);
  return fn(nodeIdToResult);
}
*/
