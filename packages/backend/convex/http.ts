import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

// Execute a workflow - POST /v1/workflows/{workflowId}/runs
http.route({
  path: "/v1/workflows/{workflowId}/runs",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // TODO: Add API key validation here
      // const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
      // if (!apiKey) {
      //   return new Response(JSON.stringify({
      //     error: { code: "unauthorized", message: "API key required" }
      //   }), {
      //     status: 401,
      //     headers: { "Content-Type": "application/json" }
      //   });
      // }

      // Extract workflowId from URL
      const url = new URL(request.url);
      const pathSegments = url.pathname.split("/");
      const workflowId = pathSegments[3]; // /v1/workflows/{workflowId}/runs

      if (!workflowId) {
        return new Response(
          JSON.stringify({
            error: { code: "invalid_request", message: "Missing workflowId" },
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Parse request body
      const body = await request.json();
      const { input, stepId } = body; // stepId is optional for step-by-step execution

      // Delegate to the executeWorkflow mutation
      const result = await ctx.runMutation(api.workflows.executeWorkflow, {
        workflowId: workflowId as Id<"workflows">,
        input: input || {},
        stepId: stepId || undefined,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: {
            code: "internal_error",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }),
});

// Get run status - GET /v1/runs/{runId}
http.route({
  path: "/v1/runs/{runId}",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const pathSegments = url.pathname.split("/");
      const runId = pathSegments[3]; // /v1/runs/{runId}

      if (!runId) {
        return new Response(
          JSON.stringify({
            error: { code: "invalid_request", message: "Missing runId" },
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const run = await ctx.runQuery(api.runs.getRun, {
        runId: runId as Id<"runs">,
      });

      if (!run) {
        return new Response(
          JSON.stringify({
            error: { code: "not_found", message: "Run not found" },
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({
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
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: {
            code: "internal_error",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }),
});

export default http;
