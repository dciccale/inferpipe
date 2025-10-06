import type React from "react";
import { cn } from "@/lib/utils";

interface BaseNodeProps {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
}

export function BaseNode({ children, className, selected }: BaseNodeProps) {
  return (
    <div
      className={cn(
        "relative bg-card border-2 border-border rounded-lg shadow-sm transition-all",
        selected && "border-primary shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BaseNodeHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function BaseNodeHeader({ children, className }: BaseNodeHeaderProps) {
  return (
    <div className={cn("px-4 py-2 border-b border-border", className)}>
      {children}
    </div>
  );
}

interface BaseNodeContentProps {
  children: React.ReactNode;
  className?: string;
}

export function BaseNodeContent({ children, className }: BaseNodeContentProps) {
  return <div className={cn("p-4 space-y-3", className)}>{children}</div>;
}

interface BaseNodeFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function BaseNodeFooter({ children, className }: BaseNodeFooterProps) {
  return (
    <div className={cn("px-4 py-2 border-t border-border", className)}>
      {children}
    </div>
  );
}
