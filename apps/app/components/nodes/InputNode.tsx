import { Button } from "@inferpipe/ui/components/button";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { FileText, Play, Shield } from "lucide-react";
import { useState } from "react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
} from "./BaseNode";

export interface InputNodeData {
  textInput: string;
  fileInput?: File | null;
  endpoint?: string;
  workflowId?: string;
}

export function InputNode({ data, selected }: NodeProps) {
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

  return (
    <BaseNode className="w-80" selected={selected}>
      <Handle type="source" position={Position.Right} />

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

      <BaseNodeContent>
        <div className="text-xs text-muted-foreground">Text</div>
        <div className="text-xs line-clamp-2">{localTextInput || "Configure input in the inspector"}</div>
      </BaseNodeContent>

      <BaseNodeFooter>
        <Button
          onClick={handleTestWorkflow}
          size="sm"
          className="w-full nodrag"
          disabled={!localTextInput && !localFile}
        >
          <Play className="w-3 h-3 mr-2" />
          Test Workflow
        </Button>
      </BaseNodeFooter>
    </BaseNode>
  );
}
