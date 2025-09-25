import React, { useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap } from "lucide-react";

export interface LLMNodeData {
  prompt: string;
  model: string;
}

export function LLMNode({ data }: NodeProps) {
  const nodeData = data as unknown as LLMNodeData;
  const [localPrompt, setLocalPrompt] = useState(nodeData.prompt || "");
  const [localModel, setLocalModel] = useState(
    nodeData.model || "gpt-3.5-turbo",
  );

  const models = [
    { value: "gpt-5-mini", label: "GPT-5 Mini" },
    { value: "gpt-5-nano", label: "GPT-5 Nano" },
    { value: "gpt-4o", label: "GPT-4o" },
  ];

  const updateNodeData = (updates: Partial<LLMNodeData>) => {
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

  return (
    <div>
      <Handle type="target" position={Position.Left} />

      <Card className="rounded-lg border border-gray-300 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">LLM Node</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Model Selection */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Model
            </label>
            <Select value={localModel} onValueChange={handleModelChange}>
              <SelectTrigger className="h-8">
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

          {/* Prompt */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Prompt
            </label>
            <Textarea
              value={localPrompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="Enter your prompt here..."
              className="min-h-20 text-sm resize-none"
            />
          </div>

          {/* Expanded Settings */}
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              <div>Model: {localModel}</div>
              <div>Tokens: ~{Math.ceil(localPrompt.length / 4)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
