"use client";

import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/api";
import { LLMNode } from "./nodes/LLMNode";
import { Plus, Play, Save } from "lucide-react";

const nodeTypes = {
  llm: LLMNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "llm",
    position: { x: 100, y: 200 },
    data: {
      prompt: "Hello! How can I help you today?",
      model: "gpt-3.5-turbo",
    },
  },
];

const initialEdges: Edge[] = [];

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState("My Workflow");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<Record<string, unknown> | null>(null);

  const createWorkflow = useMutation(api.workflows.createWorkflow);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addLLMNode = useCallback(() => {
    // Find the rightmost node to position the new node to its right
    const rightmostX = nodes.reduce(
      (maxX, node) => Math.max(maxX, node.position.x),
      0,
    );

    const newNode: Node = {
      id: `llm-${Date.now()}`,
      type: "llm",
      position: { x: rightmostX + 350, y: 200 }, // Position to the right in a horizontal flow
      data: {
        prompt: "Enter your prompt here...",
        model: "gpt-3.5-turbo",
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, nodes]);

  const updateNodeData = useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node,
        ),
      );
    },
    [setNodes],
  );

  // Prevent unused variable warning
  void updateNodeData;

  const saveWorkflow = useCallback(async () => {
    try {
      const workflowId = await createWorkflow({
        name: workflowName,
        description: "Created with workflow builder",
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type || "llm",
          position: node.position,
          data: node.data,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined,
        })),
      });
      alert(`Workflow saved with ID: ${workflowId}`);
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert("Error saving workflow");
    }
  }, [createWorkflow, workflowName, nodes, edges]);

  const executeWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      alert("No nodes to execute");
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      // First save the workflow
      const workflowId = await createWorkflow({
        name: workflowName,
        description: "Created with workflow builder",
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type || "llm",
          position: node.position,
          data: node.data,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined,
        })),
      });

      // Then execute it via Convex HTTP action
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        throw new Error(
          "Convex URL not configured. Please add NEXT_PUBLIC_CONVEX_URL to your .env.local",
        );
      }

      const response = await fetch(
        `${convexUrl}/v1/workflows/${workflowId}/runs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: { text: "Hello from the workflow builder!" },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setExecutionResult(result);
    } catch (error) {
      console.error("Error executing workflow:", error);
      setExecutionResult({
        error:
          error instanceof Error ? error.message : "Failed to execute workflow",
      });
    } finally {
      setIsExecuting(false);
    }
  }, [createWorkflow, workflowName, nodes, edges]);

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-64"
            placeholder="Workflow name"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={addLLMNode}>
            <Plus className="w-4 h-4 mr-2" />
            Add LLM Node
          </Button>
          <Button variant="outline" onClick={saveWorkflow}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={executeWorkflow} disabled={isExecuting}>
            <Play className="w-4 h-4 mr-2" />
            {isExecuting ? "Executing..." : "Execute"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 bg-background">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
              style: { stroke: "#6366f1", strokeWidth: 2 },
            }}
            connectionLineStyle={{ stroke: "#6366f1", strokeWidth: 2 }}
            snapToGrid={true}
            snapGrid={[20, 20]}>
            <Controls />
            <MiniMap />
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              color="#404040"
            />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>Execution Result</CardTitle>
            </CardHeader>
            <CardContent>
              {isExecuting && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Executing workflow...
                  </p>
                </div>
              )}
              {executionResult && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Status: {String(executionResult.status)}
                  </div>
                  {Boolean(executionResult.output) && (
                    <div className="text-sm">
                      <div className="font-medium">Output:</div>
                      <div className="bg-muted p-2 rounded text-xs whitespace-pre-wrap">
                        {typeof executionResult.output === "string"
                          ? executionResult.output
                          : JSON.stringify(executionResult.output, null, 2)}
                      </div>
                    </div>
                  )}
                  {Boolean(executionResult.error) && (
                    <div className="text-sm text-destructive">
                      <div className="font-medium">Error:</div>
                      <div className="bg-destructive/10 p-2 rounded text-xs">
                        {String(executionResult.error)}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!isExecuting && !executionResult && (
                <p className="text-sm text-muted-foreground">
                  Click Execute to run your workflow
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
