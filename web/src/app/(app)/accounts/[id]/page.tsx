import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import { getOrganization } from "@/lib/actions/organizations";
import { getContacts } from "@/lib/actions/contacts";
import { getInfluenceGraphData, getPositionHistoryByContacts, getOrganizationOptionsForInfluence } from "@/lib/actions/influence";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { AccountDetail } from "@/components/crm/account-detail";
import { ContactPanel } from "@/components/crm/contact-panel";
import { OrganizationInfluencePanel } from "@/components/influence/organization-influence-panel";
import { ContactInfluenceSection } from "@/components/influence/contact-influence-section";
import { DeleteOrganizationButton } from "@/components/crm/delete-organization-button";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const [organization, contacts] = await Promise.all([
    getOrganization(id),
    getContacts(id),
  ]);

  const [graphData, positionsByContact, orgOptions] = await Promise.all([
    getInfluenceGraphData({ organization_id: id }),
    getPositionHistoryByContacts(contacts.map((c) => c.id)),
    getOrganizationOptionsForInfluence(),
  ]);

  if (!organization || organization.organization_type !== "INSTITUTIONAL") {
    notFound();
  }

  const basePath = `/accounts/${id}`;

  return (
    <>
      <Header profile={profile!} title={organization.name} />
      <main className="flex-1 overflow-y-auto p-6">
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
