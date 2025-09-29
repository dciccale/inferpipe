import React, { useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { BaseNode, BaseNodeHeader, BaseNodeContent } from "./BaseNode";
import { Textarea } from "@inferpipe/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@inferpipe/ui/components/select";
import { Button } from "@inferpipe/ui/components/button";
import { Zap, X } from "lucide-react";
import { Checkbox } from "@inferpipe/ui/components/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@inferpipe/ui/components/alert-dialog";

export interface AINodeData {
  prompt: string;
  model: string;
  web_search_options?: unknown;
}

interface AINodeProps extends NodeProps {
  onDeleteNode?: (nodeId: string) => void;
}

export function AINode({ data, id, onDeleteNode }: AINodeProps) {
  const nodeData = data as unknown as AINodeData;
  const [localPrompt, setLocalPrompt] = useState(nodeData.prompt || "");
  const [localModel, setLocalModel] = useState(nodeData.model || "gpt-4o");
  const [localWebSearch, setLocalWebSearch] = useState(
    nodeData.web_search_options ? true : false,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const models = [
    { value: "gpt-4o", label: "GPT-4o (Latest)" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ];

  const updateNodeData = (updates: Partial<AINodeData>) => {
    // In a real implementation, this would update the node in the parent component
    Object.assign(nodeData, updates);
  };

  const handlePromptChange = (value: string) => {
    setLocalPrompt(value);
    updateNodeData({ prompt: value });
  };

  const handleModelChange = (value: string) => {
    setLocalModel(value);
    updateNodeData({ model: value });
  };

  const handleDelete = () => {
    onDeleteNode?.(id);
    setShowDeleteDialog(false);
  };

  return (
    <BaseNode className="w-80">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <BaseNodeHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Node</span>
          </div>
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive nodrag">
                <X className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete AI Node?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this node and all its
                  connections. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </BaseNodeHeader>

      <BaseNodeContent>
        {/* Model Selection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Model
          </label>
          <Select value={localModel} onValueChange={handleModelChange}>
            <SelectTrigger className="h-8 nodrag">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Enable Web Search */}
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id={`web-search-${id}`}
            checked={localWebSearch || false}
            onCheckedChange={(checked: boolean) => {
              const newVal = checked
                ? {
                    web_search_options: {
                      user_location: {
                        type: "approximate",
                        approximate: { country: "US" },
                      },
                    },
                  }
                : {};
              setLocalWebSearch(!!checked);
              updateNodeData(newVal);
            }}
          />
          <label
            htmlFor={`web-search-${id}`}
            className="text-xs text-muted-foreground cursor-pointer">
            Enable Web Search (uses tools for live results)
          </label>
        </div>

        {/* Prompt */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Prompt
          </label>
          <Textarea
            value={localPrompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handlePromptChange(e.target.value)
            }
            placeholder="Enter your prompt here..."
            className="min-h-20 text-sm resize-none nodrag"
          />
        </div>

        {/* Expanded Settings */}
        {/*
        <div className="space-y-0 pt-3 mt-3 border-t text-xs text-muted-foreground">
          <div>Model: {localModel}</div>
          <div>Tokens: ~{Math.ceil(localPrompt.length / 4)}</div>
        </div>
        */}
      </BaseNodeContent>
    </BaseNode>
  );
}
