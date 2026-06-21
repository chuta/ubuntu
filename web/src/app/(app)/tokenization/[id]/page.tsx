import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import {
  getTokenizationProject,
  getResourceAssets,
  getPhaseHistory,
} from "@/lib/actions/tokenization";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ProjectDetail } from "@/components/tokenization/project-detail";
import { ResourceAssetsPanel } from "@/components/tokenization/resource-assets-panel";
import { PhaseHistoryPanel } from "@/components/tokenization/phase-history-panel";
import { DeleteProjectButton } from "@/components/tokenization/delete-project-button";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function TokenizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();

  const [project, assets, history] = await Promise.all([
    getTokenizationProject(id),
    getResourceAssets(id),
    getPhaseHistory(id),
  ]);

  if (!project) notFound();

  return (
    <>
      <Header profile={profile!} title={project.name} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/tokenization" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Registry
          </Link>
          <div className="flex gap-2">
            <Link href={`/tokenization/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeleteProjectButton id={id} name={project.name} />
          </div>
        </div>

        <div className="space-y-6">
          <ProjectDetail project={project} />
          <ResourceAssetsPanel projectId={id} assets={assets} />
          <PhaseHistoryPanel history={history} />
        </div>
      </main>
    </>
  );
}
