"use client";

import { api } from "@inferpipe/backend/api";
import { Button } from "@inferpipe/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@inferpipe/ui/components/card";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Clock, Plus, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";

export default function Home() {
  const workflows = useQuery(api.workflows.listWorkflows);
  const createWorkflow = useMutation(api.workflows.createWorkflow);
  const router = useRouter();

  const handleCreateWorkflow = async () => {
    try {
      const workflowId = await createWorkflow({
        name: "Untitled Workflow",
        description: "A new workflow",
        status: "draft",
        nodes: [
          {
            id: "input-1",
            type: "input",
            position: { x: 100, y: 200 },
            data: {
              textInput: "",
              workflowId: "", // Will be updated after creation
              endpoint: "",
            },
          },
        ],
        edges: [],
      });

      router.push(`/builder/${workflowId}`);
    } catch (error) {
      console.error("Error creating workflow:", error);
    }
  };

  if (workflows === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading workflows...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Workflows</h1>
            <p className="text-muted-foreground mt-1">
              Build and manage your AI workflows
            </p>
          </div>
          <Button onClick={handleCreateWorkflow}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        {/* Workflows Grid */}
        {workflows.length === 0 ? (
          <div className="text-center py-12">
            <Workflow className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first workflow
            </p>
            <Button onClick={handleCreateWorkflow}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Workflow
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card
                key={workflow._id}
                className="cursor-pointer hover:shadow-md transition-shadow transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onClick={() => router.push(`/builder/${workflow._id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg truncate">
                          {workflow.name}
                        </CardTitle>
                        <StatusBadge status={workflow.status || "draft"} />
                      </div>
                    </div>
                    <Workflow className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nodes:</span>
                      <span>{workflow.nodes?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Edges:</span>
                      <span>{workflow.edges?.length || 0}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground pt-2 border-t">
                      <Clock className="w-3 h-3 mr-1" />
                      Updated{" "}
                      {formatDistanceToNow(new Date(workflow.updatedAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
