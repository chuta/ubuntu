import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getOrganization, getTerritories } from "@/lib/actions/organizations";
import { Header } from "@/components/layout/header";
import { AccountForm } from "@/components/crm/account-form";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const [organization, territories] = await Promise.all([
    getOrganization(id),
    getTerritories(),
  ]);

  if (!organization || organization.organization_type !== "INSTITUTIONAL") {
    notFound();
  }

  return (
    <>
      <Header profile={profile!} title={`Edit ${organization.name}`} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <AccountForm territories={territories} organization={organization} />
      </main>
    </>
  );
}
