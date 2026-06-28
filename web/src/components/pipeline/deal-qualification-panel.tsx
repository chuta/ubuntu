import { Badge } from "@/components/ui/badge";
import {
  QUALIFICATION_DIMENSIONS,
  dealQualificationInput,
  qualificationCompleteness,
  qualificationScoreLabel,
  qualificationScoreVariant,
} from "@/lib/constants/qualification";
import type { Deal } from "@/types/pipeline";

export function DealQualificationPanel({ deal }: { deal: Deal }) {
  const input = dealQualificationInput(deal);
  const completeness = qualificationCompleteness(input);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Qualification Scorecard</h3>
          <p className="text-xs text-gray-500">
            {completeness}/{QUALIFICATION_DIMENSIONS.length} dimensions rated
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{deal.qual_score ?? "—"}</div>
          <Badge variant={qualificationScoreVariant(deal.qual_score)}>
            {qualificationScoreLabel(deal.qual_score)}
          </Badge>
        </div>
      </div>

      {completeness === 0 ? (
        <p className="text-sm text-gray-500">
          Not yet qualified. Edit this deal to rate mutual value, technical fit, legal complexity,
          cost to test and strategic alignment.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {QUALIFICATION_DIMENSIONS.map((dim) => {
            const value = input[dim.key];
            return (
              <div key={dim.key} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{dim.label}</p>
                  <p className="text-xs text-gray-400">
                    {value != null ? dim.scale[value - 1] : "Not rated"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {value != null ? `${value}/5` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {deal.qual_success_criteria && (
        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Success criteria</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{deal.qual_success_criteria}</p>
        </div>
      )}
    </section>
  );
}
