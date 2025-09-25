import React, { useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings, Zap } from "lucide-react";

export interface LLMNodeData {
  prompt: string;
  model: string;
}

export function LLMNode({ data, selected }: NodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const nodeData = data as unknown as LLMNodeData;
  const [localPrompt, setLocalPrompt] = useState(nodeData.prompt || "");
  const [localModel, setLocalModel] = useState(nodeData.model || "gpt-3.5-turbo");

  const models = [
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
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
    <div className={`min-w-64 ${selected ? "ring-2 ring-primary" : ""}`}>
      <Handle type="target" position={Position.Left} />
      
      <Card className="bg-card shadow-lg border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">LLM Node</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings className="w-4 h-4" />
            </Button>
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

          {/* Preview */}
          {!isExpanded && localPrompt && (
            <div className="text-xs text-muted-foreground truncate">
              &ldquo;{localPrompt.slice(0, 50)}{localPrompt.length > 50 ? "..." : ""}&rdquo;
            </div>
          )}

          {/* Expanded Settings */}
          {isExpanded && (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                <div>Model: {localModel}</div>
                <div>Tokens: ~{Math.ceil(localPrompt.length / 4)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
