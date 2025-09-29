"use client";

import React from "react";
import type { ReactNode } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
  Connection,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";

import type { Node, Edge } from "@xyflow/react";

interface ExecutionResult {
  status?: unknown;
  output?: unknown;
  error?: unknown;
}

interface WorkflowBuilderProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodesDelete: (nodes: Node[]) => void;
  nodeTypes: {
    ai: (props: NodeProps) => ReactNode;
    input: (props: NodeProps) => ReactNode;
  };
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
}

function WorkflowBuilderInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodesDelete,
  nodeTypes,
  isExecuting,
  executionResult,
}: WorkflowBuilderProps) {
  const { theme } = useTheme();

  // Determine the actual theme (handle system preference)
  const actualTheme =
    theme === "system"
      ? typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

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
              style: { stroke: "#6366f1", strokeWidth: 2 },
            }}
            connectionLineStyle={{ stroke: "#6366f1", strokeWidth: 2 }}
            snapToGrid={true}
            snapGrid={[10, 10]}
            colorMode={actualTheme}
            deleteKeyCode="Delete"
            className="react-flow-minimap-spacing h-full"
            proOptions={{ hideAttribution: true }}>
            <Controls />
            <MiniMap position="bottom-right" pannable zoomable />
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              color={actualTheme === "light" ? "#e5e7eb" : "#374151"}
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
                    Status: {String(executionResult.status ?? "")}
                  </div>
                  {executionResult.output !== undefined &&
                    executionResult.output != null && (
                      <div className="text-sm">
                        <div className="font-medium">Output:</div>
                        <div className="bg-muted p-2 rounded text-xs whitespace-pre-wrap">
                          {typeof executionResult.output === "string"
                            ? executionResult.output
                            : JSON.stringify(
                                executionResult.output ?? {},
                                null,
                                2,
                              )}
                        </div>
                      </div>
                    )}
                  {executionResult.error !== undefined &&
                    executionResult.error != null && (
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

export const WorkflowBuilder = (props: WorkflowBuilderProps) => (
  <ReactFlowProvider>
    <WorkflowBuilderInner {...props} />
  </ReactFlowProvider>
);

WorkflowBuilder.displayName = "WorkflowBuilder";
