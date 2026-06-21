import { phaseLabel } from "@/lib/constants/tokenization";
import type { PhaseHistory } from "@/types/tokenization";

export function PhaseHistoryPanel({ history }: { history: PhaseHistory[] }) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-900">Phase History</h3>
        <p className="mt-2 text-sm text-gray-400">No phase transitions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Phase History</h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {history.map((h) => (
          <li key={h.id} className="px-5 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{phaseLabel(h.phase)}</span>
              <span className="text-xs text-gray-400">
                {new Date(h.entered_at).toLocaleDateString()}
                {h.completed_at && ` → ${new Date(h.completed_at).toLocaleDateString()}`}
              </span>
            </div>
            {h.outcome_summary && (
              <p className="mt-1 text-gray-500">{h.outcome_summary}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
