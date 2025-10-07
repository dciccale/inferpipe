"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@inferpipe/ui/components/alert-dialog";
import { Button } from "@inferpipe/ui/components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@inferpipe/ui/components/select";
import { Textarea } from "@inferpipe/ui/components/textarea";
import type { Node } from "@xyflow/react";
import { Braces, Trash } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_MODEL, MODEL_GROUPS } from "@/constants/models";
import { SchemaBuilder, type StructuredSchema } from "./SchemaBuilder";

interface NodeInspectorProps {
  node: Node | null;
  onChange: (nodeId: string, updates: Record<string, unknown>) => void;
  onDelete?: (nodeId: string) => void;
}

export function NodeInspector({
  node,
  onChange,
  onDelete,
}: NodeInspectorProps) {
  const [local, setLocal] = useState<Record<string, unknown>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);

  useEffect(() => {
    setLocal(node?.data || {});
  }, [node]);

  const nodeTitle = useMemo(() => {
    if (!node) return "No selection";
    if (node.type === "ai") return "AI Node";
    if (node.type === "input") return "Input Node";
    return String(node.type || "Node");
  }, [node]);

  if (!node)
    return (
      <div className="text-sm text-muted-foreground">
        Select a node to edit. When running, this area shows execution details.
      </div>
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
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground"
                    onClick={() => onDelete?.(node.id)}
                  >
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
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Model
              </div>
              <Select
                value={String(
                  (local as Record<string, unknown>).model || DEFAULT_MODEL,
                )}
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
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Output format
              </div>
              <Select
                value={String(
                  (local as Record<string, unknown>).outputFormat || "text",
                )}
                onValueChange={(v) => {
                  setLocal((prev) => ({ ...prev, outputFormat: v }));
                  onChange(node.id, { outputFormat: v });
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {String((local as Record<string, unknown>).outputFormat || "text") ===
              "json" ? (
                <div className="mt-2">
                  {((local as Record<string, unknown>).schema as StructuredSchema | undefined) ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-muted text-sm"
                      onClick={() => setSchemaOpen(true)}
                      title="Edit schema"
                    >
                      <Braces className="w-4 h-4 text-purple-500" />
                      <span>{
                        String(((local as Record<string, unknown>).schema as StructuredSchema | undefined)?.name || "schema")
                      }</span>
                    </button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setSchemaOpen(true)}>
                      + Add schema
                    </Button>
                  )}
                  {!((local as Record<string, unknown>).schema as StructuredSchema | undefined) && (
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      No schema configured. A simple {"{ message: string }"} default will be used.
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Prompt
              </div>
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
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Text Input
            </div>
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
        )}
      </div>
      <SchemaBuilder
        open={schemaOpen}
        onOpenChange={setSchemaOpen}
        value={(local as Record<string, unknown>).schema as StructuredSchema | undefined}
        onSave={(schema) => {
          setSchemaOpen(false);
          setLocal((prev) => ({ ...prev, schema }));
          onChange(node.id, { schema });
        }}
      />
    </div>
  );
}
