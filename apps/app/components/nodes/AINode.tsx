// Simplified node: configuration moved to inspector
import { Handle, type NodeProps, Position, useStore } from "@xyflow/react";
import { Zap } from "lucide-react";
import { useState } from "react";
import { MODEL_METADATA } from "@/constants/models";
import { BaseNode, BaseNodeContent, BaseNodeHeader } from "./BaseNode";

export interface AINodeData {
  prompt: string;
  model: string;
}

export function AINode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as AINodeData;
  const [localPrompt] = useState(nodeData.prompt || "");
  const [localModel] = useState(nodeData.model || "");

  const selectedModel = MODEL_METADATA[localModel];

  // Detect existing connections to hide handles by default when connected
  const hasIncoming = useStore((s) => s.edges.some((e) => e.target === id));
  const hasOutgoing = useStore((s) => s.edges.some((e) => e.source === id));

  // Editing and delete are handled by the right-panel inspector

  return (
    <BaseNode className="w-80" selected={selected}>
      <Handle
        type="target"
        position={Position.Left}
        className={[
          hasIncoming
            ? "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
            : "",
        ].join(" ")}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={[
          hasOutgoing
            ? "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
            : "",
        ].join(" ")}
      />

      <BaseNodeHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI Node</span>
        </div>
      </BaseNodeHeader>

      <BaseNodeContent>
        <div className="text-xs text-muted-foreground">
          {selectedModel?.label || localModel || "Model"}
        </div>
        {localPrompt ? (
          <div className="text-xs line-clamp-2">{localPrompt}</div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Select a model and add a prompt in the inspector
          </div>
        )}
      </BaseNodeContent>
    </BaseNode>
  );
}
