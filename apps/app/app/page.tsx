"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/api";
import { Plus, Workflow, Clock, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

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
          <p className="mt-2 text-sm text-muted-foreground">Loading workflows...</p>
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
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/builder/${workflow._id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg truncate">
                          {workflow.name}
                        </CardTitle>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          workflow.status === "published" 
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : workflow.status === "archived"
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" 
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}>
                          {workflow.status || "draft"}
                        </span>
                      </div>
                      {workflow.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {workflow.description}
                        </p>
                      )}
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
                      Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/builder/${workflow._id}`);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement run workflow
                        console.log("Run workflow:", workflow._id);
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run
                    </Button>
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
