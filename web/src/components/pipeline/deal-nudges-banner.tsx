import type { DealNudge } from "@/lib/deal-nudges";
import { AlertCircle, Clock } from "lucide-react";

export function DealNudgesBanner({ nudges }: { nudges: DealNudge[] }) {
  if (nudges.length === 0) return null;

  const hasCritical = nudges.some((n) => n.severity === "critical");

  return (
    <div
      className={`rounded-xl border px-5 py-4 ${
        hasCritical ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex items-center gap-2">
        {hasCritical ? (
          <AlertCircle className="h-4 w-4 text-red-600" />
        ) : (
          <Clock className="h-4 w-4 text-amber-600" />
        )}
        <h3 className={`text-sm font-semibold ${hasCritical ? "text-red-900" : "text-amber-900"}`}>
          This deal needs attention
        </h3>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {nudges.map((n) => (
          <li
            key={n.type}
            className={hasCritical && n.severity === "critical" ? "text-red-800" : "text-amber-800"}
          >
            <span className="font-medium">{n.label}:</span> {n.detail}
          </li>
        ))}
      </ul>
    </div>
  );
}
