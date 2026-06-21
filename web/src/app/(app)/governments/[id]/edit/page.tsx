import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getOrganization, getTerritories, getGovernmentOptions } from "@/lib/actions/organizations";
import { Header } from "@/components/layout/header";
import { GovernmentForm } from "@/components/crm/government-form";

export default async function EditGovernmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const [organization, territories, governmentOptions] = await Promise.all([
    getOrganization(id),
    getTerritories(),
    getGovernmentOptions(),
  ]);

  if (!organization || organization.organization_type !== "GOVERNMENT") {
    notFound();
  }

  return (
    <>
      <Header profile={profile!} title={`Edit ${organization.name}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <GovernmentForm
          territories={territories}
          governmentOptions={governmentOptions}
          organization={organization}
        />
      </main>
    </>
  );
}
