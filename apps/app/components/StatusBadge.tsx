import { cn } from "@/lib/utils";

type WorkflowStatus = "draft" | "published" | "archived" | string | null | undefined;

interface StatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
  size?: "sm" | "md";
}

function stylesForStatus(status: string) {
  switch (status) {
    case "published":
      return "bg-green-500/10 text-green-500 border-green-500/30";
    case "archived":
      return "bg-muted text-muted-foreground border-border";
    case "draft":
    default:
      return "bg-amber-500/10 text-amber-500 border-amber-500/30";
  }
}

export function StatusBadge({ status, className, size = "sm" }: StatusBadgeProps) {
  const normalized = (status || "draft").toString();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        stylesForStatus(normalized),
        className,
      )}
      title={`Status: ${normalized}`}
    >
      {normalized}
    </span>
  );
}

export default StatusBadge;


