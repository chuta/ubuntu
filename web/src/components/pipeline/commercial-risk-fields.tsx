"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import {
  COMMERCIAL_RISK_SEVERITIES,
  COMMERCIAL_RISK_TYPES,
  validateCommercialRiskInput,
} from "@/lib/constants/commercial-risks";
import type { CommercialRiskSeverity, CommercialRiskType, Deal } from "@/types/pipeline";

export function CommercialRiskFields({
  deal,
  suggestions = [],
}: {
  deal?: Deal;
  suggestions?: CommercialRiskType[];
}) {
  const initialFlags = deal?.commercial_risk_flags ?? [];
  const [flags, setFlags] = useState<CommercialRiskType[]>(initialFlags);
  const [severity, setSeverity] = useState<CommercialRiskSeverity | "">(
    deal?.commercial_risk_severity ?? ""
  );
  const [reviewDate, setReviewDate] = useState(deal?.commercial_risk_review_date ?? "");

  const unappliedSuggestions = suggestions.filter((s) => !flags.includes(s));

  function toggleFlag(flag: CommercialRiskType) {
    setFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  }

  function addSuggestions() {
    setFlags((prev) => [...new Set([...prev, ...unappliedSuggestions])]);
  }

  const validationError =
    flags.length > 0
      ? validateCommercialRiskInput(flags, severity || null, reviewDate || null)
      : null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-1 text-sm font-semibold text-gray-900">Commercial Risks</h3>
      <p className="mb-4 text-xs text-gray-500">COM v1.0 §6 — identify and monitor deal-level commercial risk</p>

      {unappliedSuggestions.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Suggested based on pipeline and regulatory data</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {unappliedSuggestions.map((s) => (
              <Badge key={s} variant="gold">
                {COMMERCIAL_RISK_TYPES.find((t) => t.value === s)?.label ?? s}
              </Badge>
            ))}
          </div>
          <button
            type="button"
            onClick={addSuggestions}
            className="mt-2 text-xs font-medium text-brand-purple hover:underline"
          >
            Add suggested flags
          </button>
        </div>
      )}

      <div className="space-y-3">
        {COMMERCIAL_RISK_TYPES.map((risk) => (
          <label
            key={risk.value}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${
              flags.includes(risk.value)
                ? "border-brand-purple/30 bg-brand-purple/5"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              name="commercial_risk_flags"
              value={risk.value}
              checked={flags.includes(risk.value)}
              onChange={() => toggleFlag(risk.value)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">{risk.label}</span>
              <p className="text-xs text-gray-500">{risk.description}</p>
            </div>
          </label>
        ))}
      </div>

      {flags.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Overall Severity" htmlFor="commercial_risk_severity" required>
            <Select
              id="commercial_risk_severity"
              name="commercial_risk_severity"
              required
              value={severity}
              onChange={(e) => setSeverity(e.target.value as CommercialRiskSeverity | "")}
            >
              <option value="">Select severity</option>
              {COMMERCIAL_RISK_SEVERITIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Next Review Date" htmlFor="commercial_risk_review_date">
            <Input
              id="commercial_risk_review_date"
              name="commercial_risk_review_date"
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
            />
          </FormField>
          <FormField label="Mitigation Plan" htmlFor="commercial_risk_mitigation" className="sm:col-span-2">
            <Textarea
              id="commercial_risk_mitigation"
              name="commercial_risk_mitigation"
              rows={2}
              defaultValue={deal?.commercial_risk_mitigation ?? ""}
            />
          </FormField>
          <FormField label="Notes" htmlFor="commercial_risk_notes" className="sm:col-span-2">
            <Textarea
              id="commercial_risk_notes"
              name="commercial_risk_notes"
              rows={2}
              defaultValue={deal?.commercial_risk_notes ?? ""}
            />
          </FormField>
        </div>
      )}

      {validationError && (
        <p className="mt-3 text-xs text-red-600">{validationError}</p>
      )}
    </section>
  );
}

export function parseCommercialRiskFormData(fd: FormData) {
  const flags = fd.getAll("commercial_risk_flags") as CommercialRiskType[];
  const severity = (fd.get("commercial_risk_severity") as string) || undefined;
  const reviewDate = (fd.get("commercial_risk_review_date") as string) || undefined;

  return {
    commercial_risk_flags: flags,
    commercial_risk_severity: severity as CommercialRiskSeverity | undefined,
    commercial_risk_notes: (fd.get("commercial_risk_notes") as string) || undefined,
    commercial_risk_mitigation: (fd.get("commercial_risk_mitigation") as string) || undefined,
    commercial_risk_review_date: reviewDate,
  };
}
