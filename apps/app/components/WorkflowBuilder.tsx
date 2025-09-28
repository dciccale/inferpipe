"use client";

import React, { useCallback, useState, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
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
  NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/api";
import { LLMNode } from "@/components/nodes/LLMNode";
import { InputNode } from "@/components/nodes/InputNode";
import { Plus, Play, Save } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

interface WorkflowBuilderProps {
  workflowId?: string;
  initialWorkflow?: {
    _id: string;
    name: string;
    description?: string;
    nodes: Node[];
    edges: Edge[];
  };
}

function WorkflowBuilderInner({
  workflowId,
  initialWorkflow,
}: WorkflowBuilderProps = {}) {
  const { theme } = useTheme();

  // Determine the actual theme (handle system preference)
  const actualTheme =
    theme === "system"
      ? typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  // Initialize nodes and edges from initialWorkflow or defaults
  const defaultNodes: Node[] = initialWorkflow?.nodes?.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node.data,
      // Ensure input nodes have the workflowId
      ...(node.type === "input" ? { workflowId: workflowId || "" } : {}),
    },
  })) || [
    {
      id: "input-1",
      type: "input",
      position: { x: 100, y: 200 },
      data: {
        textInput: "",
        workflowId: workflowId || "",
      },
    },
  ];

  const defaultEdges: Edge[] =
    initialWorkflow?.edges?.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })) || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [workflowName, setWorkflowName] = useState(
    initialWorkflow?.name || "My Workflow",
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<Record<
    string,
    unknown
  > | null>(null);

  const createWorkflow = useMutation(api.workflows.createWorkflow);
  const updateWorkflow = useMutation(api.workflows.updateWorkflow);

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

  const addInputNode = useCallback(() => {
    // Find the leftmost node to position the new input node to its left
    const leftmostX = nodes.reduce(
      (minX, node) => Math.min(minX, node.position.x),
      100,
    );

    const newNode: Node = {
      id: `input-${Date.now()}`,
      type: "input",
      position: { x: leftmostX - 350, y: 200 },
      data: {
        textInput: "",
        workflowId: workflowId || "",
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, nodes, workflowId]);

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) => {
        // Check if it's an input node
        const nodeToDelete = currentNodes.find((node) => node.id === nodeId);
        if (nodeToDelete?.type === "input") {
          // Count input nodes
          const inputNodes = currentNodes.filter(
            (node) => node.type === "input",
          );
          if (inputNodes.length <= 1) {
            alert(
              "Cannot delete the last input node. At least one input node must exist.",
            );
            return currentNodes; // Return unchanged nodes
          }
        }

        // Remove the node
        return currentNodes.filter((node) => node.id !== nodeId);
      });

      // Remove any edges connected to this node
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      );
    },
    [setNodes, setEdges],
  );

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

  // Create node types with delete function - memoized to prevent recreation
  const nodeTypes = useMemo(
    () => ({
      llm: (props: NodeProps) => <LLMNode {...props} onDeleteNode={deleteNode} />,
      input: (props: NodeProps) => <InputNode {...props} onDeleteNode={deleteNode} />,
    }),
    [deleteNode],
  );

  // Handle keyboard deletion
  const onNodesDelete = useCallback(
    (nodesToDelete: Node[]) => {
      nodesToDelete.forEach((node) => {
        deleteNode(node.id);
      });
    },
    [deleteNode],
  );

  const saveWorkflow = useCallback(async () => {
    try {
      const workflowData = {
        name: workflowName,
        description:
          initialWorkflow?.description || "Created with workflow builder",
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
      };

      if (workflowId && initialWorkflow) {
        // Update existing workflow
        await updateWorkflow({
          workflowId: workflowId as string,
          ...workflowData,
        });
        alert("Workflow updated successfully!");
      } else {
        // Create new workflow
        const newWorkflowId = await createWorkflow(workflowData);
        alert(`Workflow saved with ID: ${newWorkflowId}`);
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert("Error saving workflow");
    }
  }, [
    createWorkflow,
    updateWorkflow,
    workflowName,
    nodes,
    edges,
    workflowId,
    initialWorkflow,
  ]);

  const executeWorkflowMutation = useMutation(api.workflows.executeWorkflow);

  const executeWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      alert("No nodes to execute");
      return;
    }

    if (!workflowId) {
      alert("Please save the workflow first before executing");
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      // Update existing workflow before executing
      await saveWorkflow();

      // Get input from input node if it exists
      const inputNode = nodes.find((node) => node.type === "input");
      const inputData =
        inputNode?.data?.textInput || "Hello from the workflow builder!";

      // Execute workflow using Convex mutation
      const result = await executeWorkflowMutation({
        workflowId: workflowId as string,
        input: { text: inputData },
      });

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
  }, [executeWorkflowMutation, workflowId, saveWorkflow, nodes]);

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-64"
            placeholder="Workflow name"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={addInputNode}>
            <Plus className="w-4 h-4 mr-2" />
            Add Input Node
          </Button>
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
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Canvas */}
        <div className="flex-1 bg-background overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
              style: { stroke: "#6366f1", strokeWidth: 2 },
            }}
            connectionLineStyle={{ stroke: "#6366f1", strokeWidth: 2 }}
            snapToGrid={true}
            snapGrid={[20, 20]}
            colorMode={actualTheme}
            deleteKeyCode="Delete">
            <Controls />
            <MiniMap />
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              color={actualTheme === "light" ? "#e5e5e5" : "#404040"}
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

export function WorkflowBuilder(props: WorkflowBuilderProps) {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner {...props} />
    </ReactFlowProvider>
  );
}
