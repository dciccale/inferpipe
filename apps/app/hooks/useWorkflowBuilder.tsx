// useWorkflowBuilder.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useMutation } from "convex/react";
import { useAction } from "convex/react";
import { api } from "@packages/backend/api";  // This is the correct import
import { toast } from "sonner";
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

// Define Step interface here, after imports
export interface Step {
  id: string;
  step: number;
  input: unknown;
  output: unknown;
  error?: string;
}

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
  // Convex mutations - use the existing api import
  const createWorkflow = useMutation(api.workflows.createWorkflow);
  const updateWorkflow = useMutation(api.workflows.updateWorkflow);
  // Remove executeWorkflowMutation; add executeAI
  const executeAI = useAction(api.runs.executeAIAction);

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

  const [steps, setSteps] = useState<Step[]>([]);
  const [runningNodeId, setRunningNodeId] = useState<string | null>(null);

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
            console.error("Cannot delete the last input node. At least one input node must exist.");
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
        toast.success("Workflow updated successfully!");
      } else {
        const newWorkflowId = await createWorkflow(workflowData);
        toast.success(`Workflow created with ID: ${newWorkflowId}`);
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast.error("Failed to save workflow");
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

  // Updated executeWorkflow without inline comments
  const executeWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      alert("No nodes to execute");
      return;
    }

    setIsExecuting(true);
    setSteps([]);
    setExecutionResult(null);

    try {
      const inputNode = nodes.find((node) => node.type === "input");
      if (!inputNode) {
        throw new Error("No input node found. Add an input node to start the workflow.");
      }

      const initialInputValue = inputNode.data.textInput || "Default input text";

      const inputStep: Step = {
        id: inputNode.id,
        step: 1,
        input: null,
        output: { text: initialInputValue },
      };
      setSteps([inputStep]);
      let currentOutput = inputStep.output;

      const aiNodes = nodes
        .filter((node) => node.type === "ai")
        .sort((a, b) => a.position.x - b.position.x);

      const finalSteps = [inputStep];

      for (let i = 0; i < aiNodes.length; i++) {
        const node = aiNodes[i];
        const prompt = String(node.data.prompt || "Default prompt");
        const model = String(node.data.model || "gpt-4o");

        setRunningNodeId(node.id);
        const aiResult = await executeAI({
          prompt,
          model,
          previousOutput: JSON.stringify(currentOutput ?? {}),
        });

        const aiStep: Step = {
          id: node.id,
          step: i + 2,
          input: currentOutput,
          output: aiResult.output,
        };

        finalSteps.push(aiStep);
        setSteps(finalSteps);
        currentOutput = aiResult.output;
      }

      setExecutionResult({ steps: finalSteps });
    } catch (error) {
      console.error("Error executing workflow:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to execute workflow";
      setExecutionResult({ error: errorMsg });
    } finally {
      setIsExecuting(false);
      setRunningNodeId(null);
    }
  }, [nodes, executeAI]);

  // Updated executeStep similarly, without breaking comments
  const executeStep = useCallback(async (nodeId: string, providedInput?: unknown) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error("Node not found");
    }

    if (node.type === "input") {
      const inputStep: Step = {
        id: nodeId,
        step: 1,
        input: null,
        output: { text: node.data.textInput || providedInput || "Default input" },
      };
      setSteps([inputStep]);
      setExecutionResult({ steps: [inputStep] });
      return inputStep.output;
    } else if (node.type === "ai") {
      const prompt = String(node.data.prompt || "");
      const model = String(node.data.model || "gpt-4o");
      const input = providedInput || steps[steps.length - 1]?.output || {};

      setIsExecuting(true);

      try {
        setRunningNodeId(node.id);
        const aiResult = await executeAI({
          prompt,
          model,
          previousOutput: JSON.stringify(input ?? {}),
        });

        const aiStep: Step = {
          id: nodeId,
          step: steps.length + 1,
          input,
          output: aiResult.output,
        };

        const newSteps = [...steps, aiStep];
        setSteps(newSteps);
        setExecutionResult({ steps: newSteps });
        return aiResult.output;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "AI execution failed";
        const errorStep: Step = {
          id: nodeId,
          step: steps.length + 1,
          input,
          output: null,
          error: errorMsg,
        };
        const newSteps = [...steps, errorStep];
        setSteps(newSteps);
        setExecutionResult({ error: errorMsg });
        throw error;
      } finally {
        setIsExecuting(false);
        setRunningNodeId(null);
      }
    }
  }, [nodes, executeAI, steps]);

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

  const nodeIsRunning = useCallback((nodeId: string) => runningNodeId === nodeId, [runningNodeId]);

  return {
    // State
    nodes,
    edges,
    workflowName,
    setWorkflowName,
    isExecuting,
    executionResult,
    steps,
    runningNodeId,

    // Handlers
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodesDelete,
    nodeTypes,
    nodeIsRunning,

    // Actions
    addInputNode,
    addAINode,
    saveWorkflow,
    executeWorkflow,
    executeStep,
    deleteNode,
    updateNodeData,
  };
}
