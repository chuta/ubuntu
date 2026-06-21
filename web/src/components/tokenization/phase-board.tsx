"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { moveProjectPhase } from "@/lib/actions/tokenization";
import { B2G_PHASES } from "@/lib/constants/tokenization";
import type { B2GProjectPhase, TokenizationProject } from "@/types/tokenization";
import { ProjectCard } from "@/components/tokenization/project-card";
import { Button } from "@/components/ui/button";

export function PhaseBoard({ projects }: { projects: TokenizationProject[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<{ projectId: string; projectName: string; fromPhase: B2GProjectPhase; toPhase: B2GProjectPhase } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOverPhase, setDragOverPhase] = useState<B2GProjectPhase | null>(null);

  const byPhase = B2G_PHASES.reduce(
    (acc, phase) => {
      acc[phase.value] = projects.filter((p) => p.current_phase === phase.value);
      return acc;
    },
    {} as Record<B2GProjectPhase, TokenizationProject[]>
  );

  async function confirmMove() {
    if (!pending) return;
    setLoading(true);
    try {
      await moveProjectPhase(pending.projectId, pending.toPhase);
      setPending(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to move project");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent, toPhase: B2GProjectPhase) {
    e.preventDefault();
    setDragOverPhase(null);
    const projectId = e.dataTransfer.getData("projectId");
    const fromPhase = e.dataTransfer.getData("fromPhase") as B2GProjectPhase;
    if (!projectId || fromPhase === toPhase) return;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    setPending({ projectId, projectName: project.name, fromPhase, toPhase });
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {B2G_PHASES.map((phase) => {
          const phaseProjects = byPhase[phase.value];
          return (
            <div
              key={phase.value}
              className={`flex w-72 shrink-0 flex-col rounded-xl border border-gray-200 ${phase.columnColor} ${
                dragOverPhase === phase.value ? "ring-2 ring-brand-purple" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverPhase(phase.value);
              }}
              onDragLeave={() => setDragOverPhase(null)}
              onDrop={(e) => handleDrop(e, phase.value)}
            >
              <div className="border-b border-gray-200/80 px-3 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                    {phase.shortLabel}
                  </h3>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {phaseProjects.length}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-gray-500">{phase.label}</p>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2">
                {phaseProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Move project phase?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Move <strong>{pending.projectName}</strong> to{" "}
              <strong>{B2G_PHASES.find((p) => p.value === pending.toPhase)?.label}</strong>?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPending(null)} disabled={loading}>Cancel</Button>
              <Button onClick={confirmMove} disabled={loading}>{loading ? "Moving…" : "Confirm"}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
