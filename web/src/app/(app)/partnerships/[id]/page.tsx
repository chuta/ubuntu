import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import {
  getPartnership,
  getPartnershipMembers,
  getDealOptions,
} from "@/lib/actions/partnerships";
import { getOrganizationOptions, getProfileOptions } from "@/lib/actions/deals";
import { getDocumentsByPartnership } from "@/lib/actions/documents";
import { getActivities } from "@/lib/actions/activities";
import { getTasks } from "@/lib/actions/tasks";
import { getNotes } from "@/lib/actions/notes";
import { getPartnershipMilestones } from "@/lib/actions/partnership-milestones";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { PartnershipDetail } from "@/components/partnerships/partnership-detail";
import { PartnershipDealLinkPanel } from "@/components/partnerships/partnership-deal-link-panel";
import { PartnershipMembersPanel } from "@/components/partnerships/partnership-members-panel";
import { PartnershipDocumentsPanel } from "@/components/partnerships/partnership-documents-panel";
import { PartnershipMilestonesPanel } from "@/components/partnerships/partnership-milestones-panel";
import { ActivityPanel } from "@/components/pipeline/activity-panel";
import { TaskPanel } from "@/components/pipeline/task-panel";
import { NotePanel } from "@/components/pipeline/note-panel";
import { DeletePartnershipButton } from "@/components/partnerships/delete-partnership-button";
import type { WorkspaceContext } from "@/lib/workspace-context";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function PartnershipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();

  const partnership = await getPartnership(id);
  if (!partnership) notFound();

  const workspace: WorkspaceContext = {
    kind: "partnership",
    id,
    organizationId: partnership.primary_partner_id,
  };

  const [
    members,
    deals,
    organizations,
    documents,
    activities,
    tasks,
    notes,
    milestones,
    profiles,
  ] = await Promise.all([
    getPartnershipMembers(id),
    getDealOptions(),
    getOrganizationOptions(),
    getDocumentsByPartnership(id),
    getActivities(workspace),
    getTasks(workspace),
    getNotes(workspace),
    getPartnershipMilestones(id),
    getProfileOptions(),
  ]);

  return (
    <>
      <Header profile={profile!} title={partnership.name} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/partnerships" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Partnerships
          </Link>
          <div className="flex gap-2">
            <Link href={`/partnerships/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeletePartnershipButton id={id} name={partnership.name} />
          </div>
        </div>

        <div className="space-y-6">
          <PartnershipDetail partnership={partnership} />
          <PartnershipDocumentsPanel
            partnershipId={id}
            organizationId={partnership.primary_partner_id}
            documents={documents}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ActivityPanel workspace={workspace} activities={activities} />
            <TaskPanel workspace={workspace} tasks={tasks} profiles={profiles} />
          </div>
          <PartnershipMilestonesPanel
            partnershipId={id}
            milestones={milestones}
            profiles={profiles}
          />
          <NotePanel workspace={workspace} notes={notes} />
          <div className="grid gap-6 lg:grid-cols-2">
            <PartnershipDealLinkPanel partnership={partnership} deals={deals} />
            <PartnershipMembersPanel
              partnershipId={id}
              members={members}
              organizations={organizations}
            />
          </div>
        </div>
      </main>
    </>
  );
}
