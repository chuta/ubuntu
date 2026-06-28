import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import { getOrganization } from "@/lib/actions/organizations";
import { getContacts } from "@/lib/actions/contacts";
import { getInfluenceGraphData, getPositionHistoryByContacts, getOrganizationOptionsForInfluence } from "@/lib/actions/influence";
import { getDocumentsByOrganization } from "@/lib/actions/documents";
import { getActivities } from "@/lib/actions/activities";
import { getTasks } from "@/lib/actions/tasks";
import { getNotes } from "@/lib/actions/notes";
import { getProfileOptions } from "@/lib/actions/deals";
import type { WorkspaceContext } from "@/lib/workspace-context";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { AccountDetail } from "@/components/crm/account-detail";
import { ContactPanel } from "@/components/crm/contact-panel";
import { OrganizationInfluencePanel } from "@/components/influence/organization-influence-panel";
import { ContactInfluenceSection } from "@/components/influence/contact-influence-section";
import { OrganizationDocumentsPanel } from "@/components/organizations/organization-documents-panel";
import { ActivityPanel } from "@/components/pipeline/activity-panel";
import { TaskPanel } from "@/components/pipeline/task-panel";
import { NotePanel } from "@/components/pipeline/note-panel";
import { DeleteOrganizationButton } from "@/components/crm/delete-organization-button";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const basePath = `/accounts/${id}`;
  const workspace: WorkspaceContext = {
    kind: "organization",
    id,
    organizationId: id,
    basePath,
  };

  const [organization, contacts] = await Promise.all([
    getOrganization(id),
    getContacts(id),
  ]);

  const [graphData, positionsByContact, orgOptions, documents, activities, tasks, notes, profiles] =
    await Promise.all([
      getInfluenceGraphData({ organization_id: id }),
      getPositionHistoryByContacts(contacts.map((c) => c.id)),
      getOrganizationOptionsForInfluence(),
      getDocumentsByOrganization(id),
      getActivities(workspace),
      getTasks(workspace),
      getNotes(workspace),
      getProfileOptions(),
    ]);

  if (!organization || organization.organization_type !== "INSTITUTIONAL") {
    notFound();
  }

  return (
    <>
      <Header profile={profile!} title={organization.name} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/accounts" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Accounts
          </Link>
          <div className="flex gap-2">
            <Link href={`${basePath}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeleteOrganizationButton id={id} name={organization.name} basePath="/accounts" />
          </div>
        </div>

        <div className="space-y-6">
          <AccountDetail organization={organization} />
          <ContactPanel organizationId={id} contacts={contacts} basePath={basePath} />
          <OrganizationDocumentsPanel
            organizationId={id}
            documents={documents}
            entityLabel="account"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ActivityPanel workspace={workspace} activities={activities} />
            <TaskPanel workspace={workspace} tasks={tasks} profiles={profiles} />
          </div>
          <NotePanel workspace={workspace} notes={notes} />
          <ContactInfluenceSection
            contacts={contacts}
            positionsByContact={positionsByContact}
            organizations={orgOptions}
            revalidatePaths={[basePath]}
          />
          <OrganizationInfluencePanel
            organizationId={id}
            graphData={graphData}
            contacts={contacts}
            basePath={basePath}
          />
        </div>
      </main>
    </>
  );
}
