"use client";

import {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type EdgeChange,
  MiniMap,
  type NodeChange,
  type NodeProps,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import type { ReactNode } from "react";
// React default import unused
import "@xyflow/react/dist/style.css";
import "../app/reactflow.css";

import { Button } from "@inferpipe/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@inferpipe/ui/components/card";
import type { Edge, Node } from "@xyflow/react";
import { useTheme } from "next-themes";
import type { Step } from "../hooks/useWorkflowBuilder";
import { NodeInspector } from "./NodeInspector";

// (Edge already imported above)
import { Trash } from "lucide-react";

interface ExecutionResult {
  status?: unknown;
  output?: unknown;
  error?: unknown;
  steps?: Step[];
}

interface WorkflowBuilderProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodesDelete: (nodes: Node[]) => void;
  onNodeClick?: (event: unknown, node: Node) => void;
  onNodeDragStart?: (event: unknown, node: Node) => void;
  onEdgeClick?: (event: unknown, edge: Edge) => void;
  nodeTypes: {
    ai: (props: NodeProps) => ReactNode;
    input: (props: NodeProps) => ReactNode;
  };
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
  steps?: Step[];
  executeWorkflow?: () => Promise<void>;
  clearExecution?: () => void;
  // Inspector state
  isInspectorOpen?: boolean;
  selectedNode?: Node | null;
  selectedEdge?: Edge | null;
  setIsInspectorOpen?: (open: boolean) => void;
  updateNodeData?: (nodeId: string, updates: Record<string, unknown>) => void;
  deleteNode?: (nodeId: string) => void;
  deleteSelectedEdge?: () => void;
  onClearSelection?: () => void;
}

function WorkflowBuilderInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodesDelete,
  onNodeClick,
  onNodeDragStart,
  onEdgeClick,
  nodeTypes,
  isExecuting,
  executeWorkflow,
  steps,
  selectedNode,
  selectedEdge,
  updateNodeData,
  deleteNode,
  deleteSelectedEdge,
  onClearSelection,
}: WorkflowBuilderProps) {
  const { resolvedTheme } = useTheme();

  // Determine the actual theme (handle system preference)
  const actualTheme = resolvedTheme as "light" | "dark";

  // Always keep canvas visible; execution shown on right panel

  return (
    <div className="w-full h-full flex bg-background">
      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Canvas */}
        <div className="flex-1 bg-background overflow-hidden relative h-full">
          <ReactFlow
            style={{ height: "100%", width: "100%" }}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDragStart={onNodeDragStart}
            onEdgeClick={onEdgeClick}
            onPaneClick={() => onClearSelection?.()}
            isValidConnection={(connection) => {
              console.log("Connection attempt:", connection);
              return connection.source !== connection.target;
            }}
            onNodesDelete={onNodesDelete}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: nodes.length <= 1 ? 0.4 : 0.1,
              includeHiddenNodes: false,
            }}
            defaultViewport={{
              x: 100,
              y: 100,
              zoom: nodes.length <= 1 ? 0.6 : 0.9,
            }}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: false,
              style: { stroke: "var(--border)", strokeWidth: 2 },
            }}
            connectionLineStyle={{ stroke: "var(--border)", strokeWidth: 2 }}
            snapToGrid={true}
            snapGrid={[20, 20]}
            colorMode={actualTheme}
            deleteKeyCode="Delete"
            className="react-flow-minimap-spacing h-full"
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <MiniMap position="bottom-right" pannable zoomable />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.6}
              color={actualTheme === "dark" ? "#2a2a2a" : "#e5e7eb"}
            />
          </ReactFlow>
        </div>

        {/* Execution Panel (right dock) */}
        <div className="overflow-y-auto absolute right-4 top-4 w-96">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedNode
                    ? "Inspector"
                    : selectedEdge
                      ? "Edge"
                      : "Execution"}
                </CardTitle>
                {selectedEdge ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => deleteSelectedEdge?.()}
                    title="Delete edge"
                    aria-label="Delete edge"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <NodeInspector
                  node={selectedNode}
                  onChange={(id, updates) => updateNodeData?.(id, updates)}
                  onDelete={(id) => deleteNode?.(id)}
                />
              ) : selectedEdge ? (
                <div className="space-y-3 text-sm">
                  <div className="text-xs text-muted-foreground">Edge</div>
                  <div>
                    <div>
                      <span className="text-muted-foreground">ID:</span>{" "}
                      {selectedEdge.id}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Source:</span>{" "}
                      {selectedEdge.source}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>{" "}
                      {selectedEdge.target}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    onClick={executeWorkflow}
                    disabled={isExecuting}
                    className="w-full mb-4"
                  >
                    {isExecuting ? "Running..." : "Run Full Workflow"}
                  </Button>
                  {isExecuting && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Executing workflow...
                      </p>
                    </div>
                  )}
                  {(steps?.length ?? 0) > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Steps
                      </div>
                      <div className="space-y-2">
                        {steps?.map((step) => (
                          <Card key={`${step.id}-${step.step}`} className="p-2">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-medium">
                                Step {step.step}: {step.id}
                              </div>
                              {step.error ? (
                                <span className="text-[10px] text-destructive">
                                  Error
                                </span>
                              ) : null}
                            </div>
                            <details className="mt-1">
                              <summary className="text-[11px] cursor-pointer text-muted-foreground">
                                Output
                              </summary>
                              <pre className="text-[11px] bg-muted p-1 rounded mt-1 overflow-auto max-h-24 whitespace-pre-wrap">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            </details>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  {!isExecuting && (steps?.length ?? 0) === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Click Execute to run your workflow
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const WorkflowBuilder = (props: WorkflowBuilderProps) => (
  <ReactFlowProvider>
    <div className="relative h-full">
      <WorkflowBuilderInner {...props} />
    </div>
  </ReactFlowProvider>
);

WorkflowBuilder.displayName = "WorkflowBuilder";
