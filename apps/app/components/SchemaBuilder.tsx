"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@inferpipe/ui/components/alert-dialog";
import { Button } from "@inferpipe/ui/components/button";
import { Input } from "@inferpipe/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@inferpipe/ui/components/select";
import {
  Braces,
  Brackets,
  Hash,
  List,
  TextCursorInput,
  ToggleLeft,
  Trash,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type SchemaPropertyType =
  | "STR"
  | "NUM"
  | "BOOL"
  | "ENUM"
  | "OBJ"
  | "ARR";

export interface SchemaProperty {
  id?: string;
  name: string;
  type: SchemaPropertyType;
  description?: string;
  required?: boolean;
  properties?: SchemaProperty[]; // for OBJ
  enum?: string[]; // for ENUM
  items?: SchemaProperty; // for ARR
}

export interface StructuredSchema {
  name: string;
  properties: SchemaProperty[];
}

interface SchemaBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: StructuredSchema | null;
  onSave: (schema: StructuredSchema) => void;
}

function emptySchema(): StructuredSchema {
  return { name: "response_schema", properties: [] };
}

const TypeIcon = ({ type }: { type: SchemaPropertyType }) => {
  const common = "w-4 h-4";
  switch (type) {
    case "OBJ":
      return <Braces className={`${common} text-purple-500`} />;
    case "ARR":
      return <Brackets className={`${common} text-blue-500`} />;
    case "ENUM":
      return <List className={`${common} text-teal-500`} />;
    case "NUM":
      return <Hash className={`${common} text-green-500`} />;
    case "BOOL":
      return <ToggleLeft className={`${common} text-amber-500`} />;
    case "STR":
      return <TextCursorInput className={`${common} text-green-500`} />;
    default:
      return null;
  }
};

export function SchemaBuilder({
  open,
  onOpenChange,
  value,
  onSave,
}: SchemaBuilderProps) {
  const [schema, setSchema] = useState<StructuredSchema>(
    value ?? emptySchema(),
  );

  useEffect(() => {
    // ensure stable IDs for all properties to avoid re-mounting inputs on change
    const newId = () => Math.random().toString(36).slice(2, 10);
    const ensureIds = (s: StructuredSchema): StructuredSchema => {
      const withIds = (props: SchemaProperty[] | undefined): SchemaProperty[] =>
        (props || []).map((p) => ({
          id: p.id || newId(),
          name: p.name,
          type: p.type,
          description: p.description,
          required: p.required,
          enum: p.enum,
          items: p.items,
          properties: withIds(p.properties),
        }));
      return { name: s.name, properties: withIds(s.properties) };
    };
    setSchema(ensureIds(value ?? emptySchema()));
  }, [value]);

  const addTopLevel = () => {
    const newId = Math.random().toString(36).slice(2, 10);
    setSchema((s) => ({
      ...s,
      properties: [
        ...s.properties,
        { id: newId, name: "", type: "STR", required: true, description: "" },
      ],
    }));
  };

  const updateProp = (idx: number, update: Partial<SchemaProperty>) => {
    setSchema((s) => {
      const next = [...s.properties];
      next[idx] = { ...next[idx], ...update };
      return { ...s, properties: next };
    });
  };

  const removeProp = (idx: number) => {
    setSchema((s) => ({
      ...s,
      properties: s.properties.filter((_, i) => i !== idx),
    }));
  };

  const addChildProp = (parentIdx: number) => {
    setSchema((s) => {
      const next = [...s.properties];
      const parent = next[parentIdx];
      if (parent.type !== "OBJ") return s;
      const childProps = parent.properties ? [...parent.properties] : [];
      childProps.push({
        id: Math.random().toString(36).slice(2, 10),
        name: "",
        type: "STR",
        required: true,
      });
      next[parentIdx] = { ...parent, properties: childProps };
      return { ...s, properties: next };
    });
  };

  const removeChildProp = (parentIdx: number, childIdx: number) => {
    setSchema((s) => {
      const next = [...s.properties];
      const parent = next[parentIdx];
      if (parent.type !== "OBJ" || !parent.properties) return s;
      const childProps = parent.properties.filter((_, i) => i !== childIdx);
      next[parentIdx] = { ...parent, properties: childProps };
      return { ...s, properties: next };
    });
  };

  const isValid = useMemo(() => {
    if (!schema.name) return false;
    return schema.properties.every((p) => !!p.name && !!p.type);
  }, [schema]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Structured output (JSON)</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Name
            </div>
            <Input
              className="w-full h-8"
              value={schema.name}
              onChange={(e) => setSchema({ ...schema, name: e.target.value })}
              placeholder="response_schema"
            />
          </div>

          <div className="text-xs font-medium text-muted-foreground">
            Properties
          </div>
          <div className="space-y-2">
            {schema.properties.map((prop, idx) => (
              <div key={prop.id} className="rounded border border-border p-2">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 flex items-center justify-center">
                    <TypeIcon type={prop.type} />
                  </div>
                  <Input
                    className="col-span-3 h-8"
                    value={prop.name}
                    onChange={(e) => updateProp(idx, { name: e.target.value })}
                    placeholder="Property name"
                  />
                  <Select
                    value={prop.type}
                    onValueChange={(v) =>
                      updateProp(idx, { type: v as SchemaPropertyType })
                    }
                  >
                    <SelectTrigger className="col-span-2 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="STR">STR</SelectItem>
                        <SelectItem value="NUM">NUM</SelectItem>
                        <SelectItem value="BOOL">BOOL</SelectItem>
                        <SelectItem value="ENUM">ENUM</SelectItem>
                        <SelectItem value="OBJ">OBJ</SelectItem>
                        <SelectItem value="ARR">ARR</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Input
                    className="col-span-4 h-8"
                    value={prop.description || ""}
                    onChange={(e) =>
                      updateProp(idx, { description: e.target.value })
                    }
                    placeholder="Add description"
                  />
                  <label className="col-span-1 flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="h-3 w-3"
                      checked={prop.required ?? true}
                      onChange={(e) =>
                        updateProp(idx, { required: e.target.checked })
                      }
                    />
                    Required
                  </label>
                  <div className="col-span-1 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => removeProp(idx)}
                      title="Delete"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {prop.type === "ENUM" && (
                  <div className="mt-2">
                    <div className="text-[11px] text-muted-foreground mb-1">
                      Enum options (comma-separated)
                    </div>
                    <Input
                      className="w-full h-8"
                      value={(prop.enum || []).join(",")}
                      onChange={(e) =>
                        updateProp(idx, {
                          enum: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="optA,optB,optC"
                    />
                  </div>
                )}

                {prop.type === "OBJ" && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-muted-foreground">
                        Object properties
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => addChildProp(idx)}
                      >
                        + Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(prop.properties || []).map((child, cidx) => (
                        <div
                          key={child.id}
                          className="grid grid-cols-12 gap-2 items-center"
                        >
                          <div className="col-span-1 pl-4 flex items-center">
                            <TypeIcon type={child.type} />
                          </div>
                          <Input
                            className="col-span-3 h-8"
                            value={child.name}
                            onChange={(e) => {
                              const props = [...(prop.properties || [])];
                              props[cidx] = { ...child, name: e.target.value };
                              updateProp(idx, { properties: props });
                            }}
                            placeholder="Property name"
                          />
                          <Select
                            value={child.type}
                            onValueChange={(v) => {
                              const props = [...(prop.properties || [])];
                              props[cidx] = {
                                ...child,
                                type: v as SchemaPropertyType,
                              };
                              updateProp(idx, { properties: props });
                            }}
                          >
                            <SelectTrigger className="col-span-2 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="STR">STR</SelectItem>
                                <SelectItem value="NUM">NUM</SelectItem>
                                <SelectItem value="BOOL">BOOL</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <Input
                            className="col-span-4 h-8"
                            value={child.description || ""}
                            onChange={(e) => {
                              const props = [...(prop.properties || [])];
                              props[cidx] = {
                                ...child,
                                description: e.target.value,
                              };
                              updateProp(idx, { properties: props });
                            }}
                            placeholder="Add description"
                          />
                          <label className="col-span-1 flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              className="h-3 w-3"
                              checked={child.required ?? true}
                              onChange={(e) => {
                                const props = [...(prop.properties || [])];
                                props[cidx] = {
                                  ...child,
                                  required: e.target.checked,
                                };
                                updateProp(idx, { properties: props });
                              }}
                            />
                            Required
                          </label>
                          <div className="col-span-1 text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => removeChildProp(idx, cidx)}
                              title="Delete"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={addTopLevel}>
            + Add
          </Button>
        </div>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!isValid}
            onClick={() => onSave(schema)}
            className="bg-primary text-primary-foreground"
          >
            Update
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
