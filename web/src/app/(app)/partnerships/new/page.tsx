import { getProfile } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/actions/deals";
import { getDealOptions } from "@/lib/actions/partnerships";
import { Header } from "@/components/layout/header";
import { PartnershipForm } from "@/components/partnerships/partnership-form";

export default async function NewPartnershipPage() {
  const profile = await getProfile();
  const [organizations, deals] = await Promise.all([
    getOrganizationOptions(),
    getDealOptions(),
  ]);

  return (
    <>
      <Header profile={profile!} title="New Partnership" />
      <main className="flex-1 overflow-y-auto p-6">
        <PartnershipForm organizations={organizations} deals={deals} />
      </main>
    </>
  );
}
