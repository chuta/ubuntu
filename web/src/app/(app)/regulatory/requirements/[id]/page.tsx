import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import { getRequirement, deleteRequirement } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { RequirementDetail } from "@/components/regulatory/requirement-components";
import { DeleteRegulatoryButton } from "@/components/regulatory/delete-regulatory-button";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function RequirementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();
  const requirement = await getRequirement(id);
  if (!requirement) notFound();

  return (
    <>
      <Header profile={profile!} title={requirement.title} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/regulatory/requirements" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />Back to Requirements
          </Link>
          <div className="flex gap-2">
            <Link href={`/regulatory/requirements/${id}/edit`}><Button variant="outline" size="sm"><Pencil className="mr-1.5 h-4 w-4" />Edit</Button></Link>
            <DeleteRegulatoryButton name={requirement.title} redirectTo="/regulatory/requirements" onDelete={deleteRequirement.bind(null, id)} />
          </div>
        </div>
        <RequirementDetail requirement={requirement} />
      </main>
    </>
  );
}
