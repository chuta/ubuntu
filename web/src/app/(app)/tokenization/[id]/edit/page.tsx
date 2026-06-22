import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getTokenizationProject, getGovernmentOrganizationOptions } from "@/lib/actions/tokenization";
import { getDealOptions } from "@/lib/actions/partnerships";
import { Header } from "@/components/layout/header";
import { TokenizationProjectForm } from "@/components/tokenization/project-form";

export default async function EditTokenizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const [project, organizations, deals] = await Promise.all([
    getTokenizationProject(id),
    getGovernmentOrganizationOptions(),
    getDealOptions(),
  ]);

  if (!project) notFound();

  return (
    <>
      <Header profile={profile!} title={`Edit — ${project.name}`} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Edit Tokenization Project</h2>
        <TokenizationProjectForm organizations={organizations} deals={deals} project={project} />
      </main>
    </>
  );
}
