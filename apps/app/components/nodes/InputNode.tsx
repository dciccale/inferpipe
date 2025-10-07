import { Button } from "@inferpipe/ui/components/button";
import { Handle, type NodeProps, Position, useStore } from "@xyflow/react";
import { FileText, Play, Shield } from "lucide-react";
import { useState } from "react";
import { BaseNode, BaseNodeContent, BaseNodeHeader } from "./BaseNode";

export interface InputNodeData {
  textInput: string;
  fileInput?: File | null;
  endpoint?: string;
  workflowId?: string;
}

export function InputNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as InputNodeData;
  const [localTextInput] = useState(nodeData.textInput || "");
  const [localFile] = useState<File | null>(nodeData.fileInput || null);

  // Editing moved to inspector

  const handleTestWorkflow = async () => {
    // This will trigger workflow execution with the current input
    const input = localFile
      ? { file: localFile, text: localTextInput }
      : { text: localTextInput };

    console.log("Testing workflow with input:", input);
    // TODO: Implement actual workflow execution trigger
  };

  const hasOutgoing = useStore((s) => s.edges.some((e) => e.source === id));

  return (
    <BaseNode className="w-80" selected={selected}>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Input Node</span>
          </div>
          <div className="flex items-center gap-1">
            <span title="Protected from deletion">
              <Shield className="w-3 h-3 text-muted-foreground" />
            </span>
          </div>
        </div>
      </BaseNodeHeader>

      {/* Remove input text display per request */}
      <BaseNodeContent>
        <Button
          onClick={handleTestWorkflow}
          size="sm"
          className="w-full nodrag"
          disabled={!localTextInput && !localFile}
        >
          <Play className="w-3 h-3 mr-2" />
          Test Workflow
        </Button>
      </BaseNodeContent>
    </BaseNode>
  );
}
