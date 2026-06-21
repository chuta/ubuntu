import { cn } from "@/lib/utils";

const variants = {
  default: "bg-gray-100 text-gray-700",
  purple: "bg-brand-purple/10 text-brand-purple",
  gold: "bg-brand-gold/10 text-brand-gold",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function priorityVariant(priority: string | null | undefined) {
  switch (priority) {
    case "CRITICAL":
      return "red" as const;
    case "HIGH":
      return "gold" as const;
    case "MEDIUM":
      return "blue" as const;
    default:
      return "default" as const;
  }
}

export function statusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "green" as const;
    case "PROSPECT":
      return "blue" as const;
    case "DORMANT":
      return "default" as const;
    case "CHURNED":
      return "red" as const;
    default:
      return "default" as const;
  }
}
