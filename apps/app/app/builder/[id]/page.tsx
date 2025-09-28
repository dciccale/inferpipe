"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/api";
import { useParams, useRouter } from "next/navigation";
import { WorkflowBuilder } from "@/components/WorkflowBuilder";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Id } from "@packages/backend/dataModel";

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as Id<"workflows">;

  const workflow = useQuery(api.workflows.getWorkflow, {
    workflowId,
  });

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
            The workflow you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workflows
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top navigation */}
      <div className="bg-card border-b border-border p-4 flex items-center gap-4 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workflows
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{workflow.name}</h1>
          {workflow.description && (
            <p className="text-sm text-muted-foreground">
              {workflow.description}
            </p>
          )}
        </div>
      </div>

      {/* Workflow Builder */}
      <div className="flex-1 min-h-0">
        <WorkflowBuilder workflowId={workflowId} initialWorkflow={workflow} />
      </div>
    </div>
  );
}
