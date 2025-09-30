import React, { useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { BaseNode, BaseNodeHeader, BaseNodeContent } from "./BaseNode";
import { Textarea } from "@inferpipe/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@inferpipe/ui/components/select";
import { Button } from "@inferpipe/ui/components/button";
import { Zap, X } from "lucide-react";
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
import {
  MODEL_GROUPS,
  MODEL_METADATA,
  DEFAULT_MODEL,
} from "@/constants/models";

export interface AINodeData {
  prompt: string;
  model: string;
}

interface AINodeProps extends NodeProps {
  onDeleteNode?: (nodeId: string) => void;
  onUpdateNodeData?: (nodeId: string, updates: Partial<AINodeData>) => void;
}

export function AINode({
  data,
  id,
  onDeleteNode,
  onUpdateNodeData,
}: AINodeProps) {
  const nodeData = data as unknown as AINodeData;
  const [localPrompt, setLocalPrompt] = useState(nodeData.prompt || "");
  const [localModel, setLocalModel] = useState(nodeData.model || DEFAULT_MODEL);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const selectedModel = MODEL_METADATA[localModel];

  const updateNodeData = (updates: Partial<AINodeData>) => {
    if (onUpdateNodeData) {
      onUpdateNodeData(id, updates);
    } else {
      Object.assign(nodeData, updates);
    }
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
              {MODEL_GROUPS.map((group) => (
                <SelectGroup key={group.label}>
                  <SelectLabel>{group.label}</SelectLabel>
                  {group.options.map((option) => {
                    const capabilityHints: string[] = [];
                    if (option.capabilities?.webSearch) {
                      capabilityHints.push("Includes web search");
                    }
                    if (option.capabilities?.modality === "speech-to-text") {
                      capabilityHints.push("Speech to text");
                    }
                    if (option.capabilities?.modality === "text-to-speech") {
                      capabilityHints.push("Text to speech");
                    }

                    const tooltip = [option.description, ...capabilityHints]
                      .filter(Boolean)
                      .join(" • ")
                      .trim();

                    return (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        title={tooltip || undefined}>
                        {option.label}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          {selectedModel?.description ? (
            <p className="text-[11px] text-muted-foreground mt-1">
              {selectedModel.description}
            </p>
          ) : null}
          {selectedModel?.capabilities?.webSearch ? (
            <p className="text-[11px] text-primary mt-1">
              Includes live web search when supported.
            </p>
          ) : null}
          {selectedModel?.capabilities?.modality === "speech-to-text" ? (
            <p className="text-[11px] text-muted-foreground mt-1">
              Provide audio input when executing this node.
            </p>
          ) : null}
          {selectedModel?.capabilities?.modality === "text-to-speech" ? (
            <p className="text-[11px] text-muted-foreground mt-1">
              Returns synthesized audio output.
            </p>
          ) : null}
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
            className="min-h-20 text-sm nodrag"
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
