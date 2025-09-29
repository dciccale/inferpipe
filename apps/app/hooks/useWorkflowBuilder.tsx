// useWorkflowBuilder.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/api";
import type { Id } from "@packages/backend/dataModel";
import type {
  Node,
  Edge,
  NodeProps,
  NodeChange,
  EdgeChange,
  Connection,
} from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import { AINode } from "../components/nodes/AINode";
import { InputNode } from "../components/nodes/InputNode";

interface WorkflowData {
  name: string;
  description?: string;
  nodes?: Node[];
  edges?: Edge[];
}

interface UseWorkflowBuilderProps {
  workflowId?: Id<"workflows">;
  initialWorkflow?: WorkflowData;
}

export function useWorkflowBuilder({
  workflowId,
  initialWorkflow,
}: UseWorkflowBuilderProps) {
  // Convex mutations
  const createWorkflow = useMutation(api.workflows.createWorkflow);
  const updateWorkflow = useMutation(api.workflows.updateWorkflow);
  const executeWorkflowMutation = useMutation(api.workflows.executeWorkflow);

  // Workflow name state
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || "");

  // Initialize nodes and edges
  const defaultNodes: Node[] = (initialWorkflow?.nodes || []).map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node.data,
      ...(node.type === "input"
        ? { workflowId: workflowId ? String(workflowId) : "" }
        : {}),
    },
  })) || [
    {
      id: "input-1",
      type: "input",
      position: { x: 100, y: 200 },
      data: {
        textInput: "",
        workflowId: workflowId ? String(workflowId) : "",
      },
    },
  ];

  const defaultEdges: Edge[] =
    (initialWorkflow?.edges || []).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })) || [];

  // States
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [edges, setEdges] = useState<Edge[]>(defaultEdges);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<Record<
    string,
    unknown
  > | null>(null);

  // Handlers for React Flow
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds) as Edge[]),
    [setEdges],
  );

  // Actions
  const addAINode = useCallback(() => {
    setNodes((currentNodes) => {
      const spacing = 400;
      let newX = 100;

      if (currentNodes.length > 0) {
        const rightmostX = Math.max(
          ...currentNodes.map((node) => node.position.x),
        );
        newX = rightmostX + spacing;
      }

      const newNode: Node = {
        id: `ai-${Date.now()}`,
        type: "ai",
        position: { x: newX, y: 200 },
        data: {
          prompt: "Enter your prompt here...",
          model: "gpt-3.5-turbo",
        },
      };

      return [...currentNodes, newNode];
    });
  }, [setNodes]);

  const addInputNode = useCallback(() => {
    setNodes((currentNodes) => {
      const spacing = 400;
      let newX = 100;

      if (currentNodes.length > 0) {
        const leftmostX = Math.min(
          ...currentNodes.map((node) => node.position.x),
        );
        newX = leftmostX - spacing;
      }

      const newNode: Node = {
        id: `input-${Date.now()}`,
        type: "input",
        position: { x: newX, y: 200 },
        data: {
          textInput: "",
          workflowId: workflowId ? String(workflowId) : "",
        },
      };

      return [...currentNodes, newNode];
    });
  }, [setNodes, workflowId]);

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) => {
        const nodeToDelete = currentNodes.find((node) => node.id === nodeId);
        if (nodeToDelete?.type === "input") {
          const inputNodes = currentNodes.filter(
            (node) => node.type === "input",
          );
          if (inputNodes.length <= 1) {
            alert(
              "Cannot delete the last input node. At least one input node must exist.",
            );
            return currentNodes;
          }
        }
        return currentNodes.filter((node) => node.id !== nodeId);
      });

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
        name: workflowName || "My Workflow",
        description:
          initialWorkflow?.description || "Created with workflow builder",
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type || "ai",
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

      if (workflowId) {
        await updateWorkflow({
          workflowId,
          ...workflowData,
        });
        alert("Workflow updated successfully!");
      } else {
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
      await saveWorkflow();

      const inputNode = nodes.find((node) => node.type === "input");
      const inputData =
        inputNode?.data?.textInput || "Hello from the workflow builder!";

      const result = await executeWorkflowMutation({
        workflowId,
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

  // Memoized node types
  const nodeTypes = useMemo(
    () => ({
      ai: (props: NodeProps) => <AINode {...props} onDeleteNode={deleteNode} />,
      input: (props: NodeProps) => <InputNode {...props} />,
    }),
    [deleteNode],
  );

  // Update initial nodes if initialWorkflow changes (e.g., after query loads)
  useEffect(() => {
    if (initialWorkflow?.nodes && initialWorkflow.nodes.length > 0) {
      const newNodes = initialWorkflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          ...(node.type === "input"
            ? { workflowId: workflowId ? String(workflowId) : "" }
            : {}),
        },
      }));
      setNodes(newNodes);
    }
    if (initialWorkflow?.edges) {
      setEdges(
        initialWorkflow.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
      );
    }
    if (initialWorkflow?.name) {
      setWorkflowName(initialWorkflow.name);
    }
  }, [initialWorkflow, workflowId]);

  return {
    // State
    nodes,
    edges,
    workflowName,
    setWorkflowName,
    isExecuting,
    executionResult,

    // Handlers
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodesDelete,
    nodeTypes,

    // Actions
    addInputNode,
    addAINode,
    saveWorkflow,
    executeWorkflow,
    deleteNode,
    updateNodeData,
  };
}
