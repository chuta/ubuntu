import { stageLabel } from "@/lib/constants/deals";
import type { DealStageHistory } from "@/types/pipeline";
import { ArrowRight } from "lucide-react";

export function StageHistoryPanel({ history }: { history: DealStageHistory[] }) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        No stage changes recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Stage History</h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {history.map((h, i) => {
          const next = history[i + 1];
          const durationMs = next
            ? new Date(h.changed_at).getTime() - new Date(next.changed_at).getTime()
            : Date.now() - new Date(h.changed_at).getTime();
          const durationDays = Math.max(0, Math.round(durationMs / (1000 * 60 * 60 * 24)));

          return (
            <li key={h.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {h.from_stage ? (
                  <>
                    <span className="text-gray-600">{stageLabel(h.from_stage)}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </>
                ) : null}
                <span className="font-medium text-brand-purple">{stageLabel(h.to_stage)}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(h.changed_at).toLocaleString()}
                {h.changed_by?.full_name && ` · ${h.changed_by.full_name}`}
                {durationDays > 0 && ` · ${durationDays}d in previous stage`}
              </p>
              {h.notes && <p className="mt-1 text-sm text-gray-600">{h.notes}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
