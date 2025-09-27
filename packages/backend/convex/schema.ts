import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Workflows table - stores workflow definitions
  workflows: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
    // Nodes in the workflow graph
    nodes: v.array(v.object({
      id: v.string(),
      type: v.string(), // "llm", "input", "output", "transform", "branch"
      position: v.object({
        x: v.number(),
        y: v.number(),
      }),
      data: v.any(), // Node-specific configuration
    })),
    // Edges connecting nodes
    edges: v.array(v.object({
      id: v.string(),
      source: v.string(),
      target: v.string(),
      sourceHandle: v.optional(v.string()),
      targetHandle: v.optional(v.string()),
    })),
    // Workflow-level variables
    variables: v.optional(v.array(v.object({
      name: v.string(),
      type: v.string(),
      defaultValue: v.optional(v.any()),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Runs table - stores workflow execution instances
  runs: defineTable({
    workflowId: v.id("workflows"),
    status: v.union(
      v.literal("pending"),
      v.literal("running"), 
      v.literal("completed"),
      v.literal("failed")
    ),
    input: v.any(), // Input data for the workflow
    output: v.optional(v.any()), // Final output
    error: v.optional(v.string()), // Error message if failed
    metadata: v.optional(v.object({
      totalSteps: v.optional(v.number()),
      completedSteps: v.optional(v.number()),
      cost: v.optional(v.number()),
      duration: v.optional(v.number()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_workflow", ["workflowId"]),

  // Steps table - stores individual step executions within a run
  steps: defineTable({
    runId: v.id("runs"),
    nodeId: v.string(), // Reference to node in workflow
    nodeType: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"), 
      v.literal("failed")
    ),
    input: v.any(),
    output: v.optional(v.any()),
    error: v.optional(v.string()),
    metadata: v.optional(v.object({
      model: v.optional(v.string()),
      tokens: v.optional(v.object({
        input: v.optional(v.number()),
        output: v.optional(v.number()),
      })),
      cost: v.optional(v.number()),
      duration: v.optional(v.number()),
    })),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  }).index("by_run", ["runId"]),

  // API Keys table - for authentication
  apiKeys: defineTable({
    name: v.string(),
    keyHash: v.string(), // Hashed version of the key
    scopes: v.array(v.string()), // ["workflows:read", "workflows:write", "runs:execute"]
    isActive: v.boolean(),
    lastUsedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_hash", ["keyHash"]),
});
