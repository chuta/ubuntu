"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import {
  QUALIFICATION_DIMENSIONS,
  computeQualificationScore,
  qualificationScoreLabel,
  qualificationScoreVariant,
  type QualificationInput,
} from "@/lib/constants/qualification";
import type { Deal, QualificationDimension } from "@/types/pipeline";

export function QualificationFields({ deal }: { deal?: Deal }) {
  const [values, setValues] = useState<QualificationInput>({
    qual_mutual_value: deal?.qual_mutual_value ?? null,
    qual_technical_fit: deal?.qual_technical_fit ?? null,
    qual_legal_complexity: deal?.qual_legal_complexity ?? null,
    qual_cost_to_test: deal?.qual_cost_to_test ?? null,
    qual_strategic_alignment: deal?.qual_strategic_alignment ?? null,
  });

  const score = useMemo(() => computeQualificationScore(values), [values]);

  function setValue(key: QualificationDimension, raw: string) {
    setValues((prev) => ({ ...prev, [key]: raw ? Number(raw) : null }));
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Qualification Scorecard</h3>
          <p className="text-xs text-gray-500">Rate each dimension 1–5 to compute a composite fit score</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{score ?? "—"}</div>
          <Badge variant={qualificationScoreVariant(score)}>{qualificationScoreLabel(score)}</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {QUALIFICATION_DIMENSIONS.map((dim) => (
          <FormField key={dim.key} label={dim.label} htmlFor={dim.key}>
            <Select
              id={dim.key}
              name={dim.key}
              value={values[dim.key]?.toString() ?? ""}
              onChange={(e) => setValue(dim.key, e.target.value)}
            >
              <option value="">Not rated</option>
              {dim.scale.map((label, i) => (
                <option key={i} value={i + 1}>
                  {i + 1} — {label}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-gray-400">{dim.description}</p>
          </FormField>
        ))}
      </div>

      <FormField label="Success Criteria" htmlFor="qual_success_criteria" className="mt-4">
        <Textarea
          id="qual_success_criteria"
          name="qual_success_criteria"
          rows={2}
          placeholder="What does a successful test / partnership look like? How will we measure it?"
          defaultValue={deal?.qual_success_criteria ?? ""}
        />
      </FormField>
    </section>
  );
}

export function parseQualificationFormData(fd: FormData) {
  const num = (key: string) => {
    const raw = fd.get(key) as string;
    return raw ? Number(raw) : undefined;
  };
  return {
    qual_mutual_value: num("qual_mutual_value"),
    qual_technical_fit: num("qual_technical_fit"),
    qual_legal_complexity: num("qual_legal_complexity"),
    qual_cost_to_test: num("qual_cost_to_test"),
    qual_strategic_alignment: num("qual_strategic_alignment"),
    qual_success_criteria: (fd.get("qual_success_criteria") as string) || undefined,
  };
}
