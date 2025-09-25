import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

const http = httpRouter();

// Execute a workflow - POST /v1/workflows/{workflowId}/runs
http.route({
  path: "/v1/workflows/{workflowId}/runs",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Extract workflowId from URL
      const url = new URL(request.url);
      const pathSegments = url.pathname.split('/');
      const workflowId = pathSegments[3]; // /v1/workflows/{workflowId}/runs

      if (!workflowId) {
        return new Response(JSON.stringify({
          error: { code: "invalid_request", message: "Missing workflowId" }
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Parse request body
      const body = await request.json();
      const { input } = body;

      // Create run
      const runId = await ctx.runMutation(api.runs.createRun, {
        workflowId: workflowId as any,
        input: input || {},
      });

      // Get workflow to execute
      const workflow = await ctx.runQuery(api.workflows.getWorkflow, {
        workflowId: workflowId as any,
      });

      if (!workflow) {
        return new Response(JSON.stringify({
          error: { code: "not_found", message: "Workflow not found" }
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Execute workflow immediately for simple cases
      try {
        await ctx.runMutation(api.runs.updateRunStatus, {
          runId,
          status: "running",
        });

        const result = await executeWorkflow(ctx, workflow, runId, input);

        await ctx.runMutation(api.runs.updateRunStatus, {
          runId,
          status: "completed",
          output: result,
        });

        return new Response(JSON.stringify({
          runId,
          status: "completed",
          output: result,
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });

      } catch (error) {
        await ctx.runMutation(api.runs.updateRunStatus, {
          runId,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });

        return new Response(JSON.stringify({
          error: { 
            code: "run_failed", 
            message: error instanceof Error ? error.message : "Unknown error" 
          }
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

    } catch (error) {
      return new Response(JSON.stringify({
        error: { 
          code: "internal_error", 
          message: error instanceof Error ? error.message : "Unknown error" 
        }
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  })
});

// Get run status - GET /v1/runs/{runId}
http.route({
  path: "/v1/runs/{runId}",
  method: "GET", 
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const pathSegments = url.pathname.split('/');
      const runId = pathSegments[3]; // /v1/runs/{runId}

      if (!runId) {
        return new Response(JSON.stringify({
          error: { code: "invalid_request", message: "Missing runId" }
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const run = await ctx.runQuery(api.runs.getRun, {
        runId: runId as any,
      });

      if (!run) {
        return new Response(JSON.stringify({
          error: { code: "not_found", message: "Run not found" }
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({
        runId: run._id,
        workflowId: run.workflowId,
        status: run.status,
        input: run.input,
        output: run.output,
        error: run.error,
        metadata: run.metadata,
        steps: run.steps,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: { 
          code: "internal_error", 
          message: error instanceof Error ? error.message : "Unknown error" 
        }
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  })
});

// Simple workflow execution function
async function executeWorkflow(ctx: any, workflow: any, runId: any, input: any) {
  // For now, just execute LLM nodes sequentially
  const llmNodes = workflow.nodes.filter((node: any) => node.type === "llm");
  
  if (llmNodes.length === 0) {
    return { message: "No LLM nodes to execute" };
  }

  // Execute first LLM node as MVP
  const node = llmNodes[0];
  const stepId = await ctx.runMutation(api.steps.createStep, {
    runId,
    nodeId: node.id,
    nodeType: node.type,
    input: { ...input, ...node.data },
  });

  try {
    await ctx.runMutation(api.steps.updateStep, {
      stepId,
      status: "running",
    });

    // Execute LLM call
    const result = await executeLLMNode(node, input);

    await ctx.runMutation(api.steps.updateStep, {
      stepId,
      status: "completed",
      output: result,
      metadata: {
        model: node.data.model,
        tokens: result.tokens,
        cost: result.cost,
      },
    });

    return result.output;

  } catch (error) {
    await ctx.runMutation(api.steps.updateStep, {
      stepId,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

// Execute an LLM node
async function executeLLMNode(node: any, input: any) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

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

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: processedPrompt }],
    max_tokens: 1000,
  });

  const output = response.choices[0].message.content;
  
  return {
    output,
    tokens: {
      input: response.usage?.prompt_tokens || 0,
      output: response.usage?.completion_tokens || 0,
    },
    cost: calculateCost(model, response.usage?.prompt_tokens || 0, response.usage?.completion_tokens || 0),
  };
}

// Simple cost calculation (rough estimates)
function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs: Record<string, { input: number; output: number }> = {
    "gpt-3.5-turbo": { input: 0.0015 / 1000, output: 0.002 / 1000 },
    "gpt-4": { input: 0.03 / 1000, output: 0.06 / 1000 },
    "gpt-4-turbo": { input: 0.01 / 1000, output: 0.03 / 1000 },
  };

  const modelCost = costs[model] || costs["gpt-3.5-turbo"];
  return (inputTokens * modelCost.input) + (outputTokens * modelCost.output);
}

export default http;
