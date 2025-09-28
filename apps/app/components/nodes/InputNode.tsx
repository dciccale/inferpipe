import React, { useState, useRef } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { BaseNode, BaseNodeHeader, BaseNodeContent, BaseNodeFooter } from "./BaseNode";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Play, Shield } from "lucide-react";

export interface InputNodeData {
  textInput: string;
  fileInput?: File | null;
  endpoint?: string;
  workflowId?: string;
}

export function InputNode({ data, id }: NodeProps) {
  const nodeData = data as unknown as InputNodeData;
  const [localTextInput, setLocalTextInput] = useState(nodeData.textInput || "");
  const [localFile, setLocalFile] = useState<File | null>(nodeData.fileInput || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateNodeData = (updates: Partial<InputNodeData>) => {
    // In a real implementation, this would update the node in the parent component
    Object.assign(nodeData, updates);
  };

  const handleTextInputChange = (value: string) => {
    setLocalTextInput(value);
    updateNodeData({ textInput: value });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setLocalFile(file);
    updateNodeData({ fileInput: file });
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleTestWorkflow = async () => {
    // This will trigger workflow execution with the current input
    const input = localFile 
      ? { file: localFile, text: localTextInput }
      : { text: localTextInput };
    
    console.log("Testing workflow with input:", input);
    // TODO: Implement actual workflow execution trigger
  };

  // Generate endpoint URL based on workflow ID
  const workflowId = nodeData.workflowId || nodeData.endpoint?.split('/')[5] || 'unknown';
  const endpointUrl = `${process.env.NEXT_PUBLIC_CONVEX_HTTP_URL}/v1/workflows/${workflowId}/runs`;

  return (
    <>
      <BaseNode className="w-80">
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
          {/* Endpoint Display */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Endpoint
            </label>
            <div className="bg-muted p-2 rounded text-xs font-mono break-all">
              POST {endpointUrl}
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Text Input
            </label>
            <Textarea
              value={localTextInput}
              onChange={(e) => handleTextInputChange(e.target.value)}
              placeholder="Enter test input here..."
              className="min-h-20 text-sm resize-none nodrag"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              File Input (Optional)
            </label>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".txt,.json,.csv,.md"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleFileUpload}
                className="w-full nodrag"
              >
                <Upload className="w-3 h-3 mr-2" />
                {localFile ? "Change File" : "Upload File"}
              </Button>
              {localFile && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  Selected: {localFile.name} ({Math.round(localFile.size / 1024)}KB)
                </div>
              )}
            </div>
          </div>

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
          
          <div className="mt-2 space-y-0 text-xs text-muted-foreground">
            <div>Entry Point: {id}</div>
            <div>Input Type: {localFile ? "File + Text" : "Text"}</div>
          </div>
        </BaseNodeFooter>
      </BaseNode>
      
      <Handle 
        type="source" 
        position={Position.Right} 
      />
    </>
  );
}
