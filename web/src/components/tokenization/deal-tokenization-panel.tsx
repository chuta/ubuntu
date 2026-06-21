"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { linkDealTokenization } from "@/lib/actions/tokenization";
import { phaseLabel, projectStatusVariant, PROJECT_STATUSES, labelFor } from "@/lib/constants/tokenization";
import { Badge } from "@/components/ui/badge";
import type { TokenizationProject } from "@/types/tokenization";
import { Layers } from "lucide-react";

export function DealTokenizationPanel({
  dealId,
  project,
  projectOptions,
}: {
  dealId: string;
  project: TokenizationProject | null;
  projectOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(project?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await linkDealTokenization(dealId, projectId || null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to link project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Linked Tokenization Project</h3>
      </div>
      <div className="p-5">
        {project && (
          <div className="mb-4 rounded-lg border border-brand-gold/20 bg-brand-gold/5 p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-gold" />
              <Link href={`/tokenization/${project.id}`} className="font-medium text-brand-purple hover:underline">
                {project.name}
              </Link>
              <Badge variant={projectStatusVariant(project.status)}>
                {labelFor(PROJECT_STATUSES, project.status)}
              </Badge>
              <span className="text-xs text-gray-500">{phaseLabel(project.current_phase)}</span>
            </div>
          </div>
        )}
        <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">No project linked</option>
          {projectOptions.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
        <Button size="sm" className="mt-4" onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : "Save Link"}
        </Button>
      </div>
    </div>
  );
}
