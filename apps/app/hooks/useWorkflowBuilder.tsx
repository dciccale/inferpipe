// useWorkflowBuilder.tsx

import { api } from "@packages/backend/api"; // This is the correct import
import type { Id } from "@packages/backend/dataModel";
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  NodeProps,
} from "@xyflow/react";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { useAction, useMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AINode } from "../components/nodes/AINode";
import { InputNode } from "../components/nodes/InputNode";
import { DEFAULT_MODEL } from "../constants/models";

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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const hasHydratedRef = useRef(false);
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSnapshotRef = useRef<string | null>(null);

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
    [],
  );

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedEdgeId(null);
    setSelectedNodeId(node.id);
    setIsInspectorOpen(true);
  }, []);

  // Select node on drag start as well, to keep inspector in sync with visual selection
  const onNodeDragStart = useCallback((_: unknown, node: Node) => {
    setSelectedEdgeId(null);
    setSelectedNodeId(node.id);
    setIsInspectorOpen(true);
  }, []);

  const onEdgeClick = useCallback((_: unknown, edge: Edge) => {
    setSelectedNodeId(null);
    setSelectedEdgeId(edge.id);
    setIsInspectorOpen(true);
  }, []);

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
          model: DEFAULT_MODEL,
          outputFormat: "text",
        },
      };

      return [...currentNodes, newNode];
    });
  }, []);

  // Removed addInputNode: input node is singular and created by default

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((currentNodes) => {
      const nodeToDelete = currentNodes.find((node) => node.id === nodeId);
      if (nodeToDelete?.type === "input") {
        const inputNodes = currentNodes.filter((node) => node.type === "input");
        if (inputNodes.length <= 1) {
          console.error(
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
  }, []);

  const deleteSelectedEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  }, [selectedEdgeId]);

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
    [],
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
      } else {
        await createWorkflow(workflowData);
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

  // Debounced autosave whenever nodes/edges/name change (after hydration)
  useEffect(() => {
    if (!hasHydratedRef.current) return;

    const snapshot = JSON.stringify({
      name: workflowName || "My Workflow",
      nodes: nodes.map((n) => ({ id: n.id, t: n.type, p: n.position, d: n.data })),
      edges: edges.map((e) => ({ id: e.id, s: e.source, t: e.target, sh: e.sourceHandle, th: e.targetHandle })),
    });

    if (lastSavedSnapshotRef.current === snapshot) return;

    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    // Debounce 800ms general edits; reactflow drags will batch
    autosaveTimeoutRef.current = setTimeout(async () => {
      lastSavedSnapshotRef.current = snapshot;
      try {
        await saveWorkflow();
      } catch (e) {
        console.error("Autosave failed", e);
      }
    }, 800);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [workflowName, nodes, edges, saveWorkflow]);

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
        throw new Error(
          "No input node found. Add an input node to start the workflow.",
        );
      }

      const initialInputValue =
        inputNode.data.textInput || "Default input text";

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
        const model = String(node.data.model || DEFAULT_MODEL);
        const outputFormat = String(node.data.outputFormat || "text");
        const schema = node.data.schema as unknown;

        setRunningNodeId(node.id);
        const aiResult = await executeAI({
          prompt,
          model,
          previousOutput: JSON.stringify(currentOutput ?? {}),
          outputFormat,
          schema,
        } as any);

        const aiStep: Step = {
          id: node.id,
          step: i + 2,
          input: currentOutput,
          output: aiResult,
        };

        finalSteps.push(aiStep);
        setSteps(finalSteps);
        currentOutput = aiResult;
      }

      setExecutionResult({ steps: finalSteps });
    } catch (error) {
      console.error("Error executing workflow:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to execute workflow";
      setExecutionResult({ error: errorMsg });
    } finally {
      setIsExecuting(false);
      setRunningNodeId(null);
    }
  }, [nodes, executeAI]);

  // Updated executeStep similarly, without breaking comments
  const executeStep = useCallback(
    async (nodeId: string, providedInput?: unknown) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        throw new Error("Node not found");
      }

      if (node.type === "input") {
        const inputStep: Step = {
          id: nodeId,
          step: 1,
          input: null,
          output: {
            text: node.data.textInput || providedInput || "Default input",
          },
        };
        setSteps([inputStep]);
        setExecutionResult({ steps: [inputStep] });
        return inputStep.output;
      } else if (node.type === "ai") {
        const prompt = String(node.data.prompt || "");
        const model = String(node.data.model || DEFAULT_MODEL);
        const outputFormat = String(node.data.outputFormat || "text");
        const schema = node.data.schema as unknown;
        const input = providedInput || steps[steps.length - 1]?.output || {};

        setIsExecuting(true);

        try {
          setRunningNodeId(node.id);
          const aiResult = await executeAI({
            prompt,
            model,
            previousOutput: JSON.stringify(input ?? {}),
            outputFormat,
            schema,
          } as any);

          const aiStep: Step = {
            id: nodeId,
            step: steps.length + 1,
            input,
            output: aiResult,
          };

          const newSteps = [...steps, aiStep];
          setSteps(newSteps);
          setExecutionResult({ steps: newSteps });
          return aiResult;
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "AI execution failed";
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
    },
    [nodes, executeAI, steps],
  );

  // Memoized node types
  const nodeTypes = useMemo(
    () => ({
      ai: (props: NodeProps) => <AINode {...props} />,
      input: (props: NodeProps) => <InputNode {...props} />,
    }),
    [],
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
    // mark hydrated on first load of initialWorkflow changes
    hasHydratedRef.current = true;
    // prime lastSavedSnapshot to avoid immediate save after hydration
    const snapshot = JSON.stringify({
      name: (initialWorkflow?.name || "My Workflow") as string,
      nodes: (initialWorkflow?.nodes || []).map((n) => ({ id: n.id, t: n.type, p: n.position, d: n.data })),
      edges: (initialWorkflow?.edges || []).map((e) => ({ id: e.id, s: e.source, t: e.target, sh: e.sourceHandle, th: e.targetHandle })),
    });
    lastSavedSnapshotRef.current = snapshot;
  }, [initialWorkflow, workflowId]);

  const nodeIsRunning = useCallback(
    (nodeId: string) => runningNodeId === nodeId,
    [runningNodeId],
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId],
  );

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) || null,
    [edges, selectedEdgeId],
  );

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setIsInspectorOpen(false);
  }, []);

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
    selectedNodeId,
    selectedNode,
    isInspectorOpen,

    // Handlers
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onNodeDragStart,
    onEdgeClick,
    onNodesDelete,
    nodeTypes,
    nodeIsRunning,

    // Actions
    addAINode,
    saveWorkflow,
    executeWorkflow,
    executeStep,
    deleteNode,
    updateNodeData,
    clearSelection,
    setIsInspectorOpen,
    setSelectedNodeId,
    selectedEdge,
    deleteSelectedEdge,
  };
}
