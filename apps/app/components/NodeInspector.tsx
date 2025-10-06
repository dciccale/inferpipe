"use client";

import { Button } from "@inferpipe/ui/components/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@inferpipe/ui/components/select";
import { Textarea } from "@inferpipe/ui/components/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@inferpipe/ui/components/alert-dialog";
import { Trash } from "lucide-react";
import type { Node } from "@xyflow/react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_MODEL, MODEL_GROUPS } from "@/constants/models";

interface NodeInspectorProps {
  node: Node | null;
  onChange: (nodeId: string, updates: Record<string, unknown>) => void;
  onDelete?: (nodeId: string) => void;
}

export function NodeInspector({ node, onChange, onDelete }: NodeInspectorProps) {
  const [local, setLocal] = useState<Record<string, unknown>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setLocal(node?.data || {});
  }, [node]);

  const nodeTitle = useMemo(() => {
    if (!node) return "No selection";
    if (node.type === "ai") return "AI Node";
    if (node.type === "input") return "Input Node";
    return String(node.type || "Node");
  }, [node]);

  if (!node) return (
    <div className="text-sm text-muted-foreground">Select a node to edit. When running, this area shows execution details.</div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{nodeTitle}</div>
        {onDelete && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              onClick={() => setConfirmOpen(true)}
              title="Delete node"
              aria-label="Delete node"
            >
              <Trash className="w-4 h-4" />
            </Button>
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete node?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this node and its connections.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => onDelete?.(node.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      <div className="space-y-4">
          {node.type === "ai" && (
            <>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Model</div>
                <Select
                  value={String((local as Record<string, unknown>).model || DEFAULT_MODEL)}
                  onValueChange={(v) => {
                    setLocal((prev) => ({ ...prev, model: v }));
                    onChange(node.id, { model: v });
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_GROUPS.map((g) => (
                      <SelectGroup key={g.label}>
                        <SelectLabel>{g.label}</SelectLabel>
                        {g.options.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Prompt</div>
                <Textarea
                  value={String((local as Record<string, unknown>).prompt || "")}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const v = e.target.value;
                    setLocal((prev) => ({ ...prev, prompt: v }));
                    onChange(node.id, { prompt: v });
                  }}
                  placeholder="Enter your prompt here..."
                  className="min-h-28 text-sm"
                />
              </div>
            </>
          )}

          {node.type === "input" && (
            <>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Text Input</div>
                <Textarea
                  value={String((local as Record<string, unknown>).textInput || "")}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const v = e.target.value;
                    setLocal((prev) => ({ ...prev, textInput: v }));
                    onChange(node.id, { textInput: v });
                  }}
                  placeholder="Enter test input..."
                  className="min-h-20 text-sm"
                />
              </div>
            </>
          )}
      </div>
    </div>
  );
}


