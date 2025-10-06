"use client";

import { Button } from "@inferpipe/ui/components/button";
import { Input } from "@inferpipe/ui/components/input";
import { api } from "@packages/backend/api";
import type { Id } from "@packages/backend/dataModel";
import { useQuery } from "convex/react";
import { ArrowLeft, Play, Plus, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useMemo } from "react";
import { WorkflowBuilder } from "@/components/WorkflowBuilder";
import { StatusBadge } from "@/components/StatusBadge";
// NodeInspector is rendered inside WorkflowBuilder now
import { useWorkflowBuilder } from "@/hooks/useWorkflowBuilder";

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as Id<"workflows">;

  const workflow = useQuery(api.workflows.getWorkflow, {
    workflowId,
  });

  const initialData = useMemo(
    () =>
      workflow
        ? {
            name: workflow.name,
            description: workflow.description,
            nodes: workflow.nodes || [],
            edges: workflow.edges || [],
          }
        : undefined,
    [workflow],
  );

  const workflowHook = useWorkflowBuilder({
    workflowId,
    initialWorkflow: initialData,
  });

  const {
    addInputNode,
    addAINode,
    saveWorkflow,
    executeWorkflow,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onNodeDragStart,
    onNodesDelete,
    nodeTypes,
    isExecuting,
    executionResult,
    selectedNode,
    isInspectorOpen,
    setIsInspectorOpen,
    updateNodeData,
    clearSelection,
    workflowName: hookWorkflowName,
    setWorkflowName: setHookWorkflowName,
  } = workflowHook;

  if (workflow === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading workflow...
          </p>
        </div>
      </div>
    );
  }

  if (workflow === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Workflow not found</h2>
          <p className="text-muted-foreground mb-4">
            The workflow you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top navigation */}
      <div className="bg-card border-b border-border py-3 px-4 flex items-center gap-4 flex-shrink-0 overflow-x-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
        <div className="flex-1 min-w-0 flex items-center">
          <div className="group max-w-fit">
            <Input
              value={hookWorkflowName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setHookWorkflowName(e.target.value)
              }
              className="text-2xl font-bold h-auto p-3 border-none shadow-none focus-visible:ring-1 focus-visible:ring-ring bg-transparent hover:bg-muted/50 focus:bg-background transition-colors duration-200 md:text-2xl min-w-0 w-auto min-w-[8ch] max-w-[50vw]"
              placeholder="Untitled Workflow"
            />
          </div>
          {workflow?.status && (
            <StatusBadge status={workflow.status} className="ml-3" />
          )}
          {/*
          {workflow.description && (
            <p className="text-sm text-muted-foreground mt-2 ml-4">
              {workflow.description}
            </p>
          )}
            */}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={addInputNode}>
            <Plus className="w-4 h-4 mr-2" />
            Add Input Node
          </Button>
          <Button variant="outline" size="sm" onClick={addAINode}>
            <Plus className="w-4 h-4 mr-2" />
            Add AI Node
          </Button>
          <Button variant="outline" size="sm" onClick={saveWorkflow}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button size="sm" onClick={executeWorkflow}>
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>
        </div>
      </div>

      {/* Workflow Builder */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <WorkflowBuilder
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          isExecuting={isExecuting}
          executionResult={executionResult}
          steps={workflowHook.steps}
          executeWorkflow={executeWorkflow}
          isInspectorOpen={isInspectorOpen}
          selectedNode={selectedNode as unknown as never}
          setIsInspectorOpen={setIsInspectorOpen}
          updateNodeData={updateNodeData}
          deleteNode={workflowHook.deleteNode}
          onClearSelection={clearSelection}
        />
      </div>
    </div>
  );
}
