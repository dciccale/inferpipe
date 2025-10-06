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
  setIsInspectorOpen?: (open: boolean) => void;
  updateNodeData?: (nodeId: string, updates: Record<string, unknown>) => void;
  deleteNode?: (nodeId: string) => void;
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
  nodeTypes,
  isExecuting,
  executeWorkflow,
  steps,
  selectedNode,
  updateNodeData,
  deleteNode,
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
              animated: true,
              style: { stroke: "var(--primary)", strokeWidth: 2 },
            }}
            connectionLineStyle={{ stroke: "var(--primary)", strokeWidth: 2 }}
            snapToGrid={true}
            snapGrid={[10, 10]}
            colorMode={actualTheme}
            deleteKeyCode="Delete"
            className="react-flow-minimap-spacing h-full"
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <MiniMap position="bottom-right" pannable zoomable />
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              color={actualTheme === "dark" ? "var(--muted)" : "var(--border)"}
            />
          </ReactFlow>
        </div>

        {/* Execution Panel (right dock) */}
        <div className="w-96 bg-card border-l border-border p-4 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>{selectedNode ? "Inspector" : "Execution"}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <NodeInspector
                  node={selectedNode}
                  onChange={(id, updates) => updateNodeData?.(id, updates)}
                  onDelete={(id) => deleteNode?.(id)}
                />
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
                      <div className="text-xs font-semibold text-muted-foreground">Steps</div>
                      <div className="space-y-2">
                        {steps?.map((step) => (
                          <Card key={`${step.id}-${step.step}`} className="p-2">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-medium">
                                Step {step.step}: {step.id}
                              </div>
                              {step.error ? (
                                <span className="text-[10px] text-destructive">Error</span>
                              ) : null}
                            </div>
                            <details className="mt-1">
                              <summary className="text-[11px] cursor-pointer text-muted-foreground">Output</summary>
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
                    <p className="text-sm text-muted-foreground">Click Execute to run your workflow</p>
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
