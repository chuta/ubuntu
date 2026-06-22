import { getProfile } from "@/lib/supabase/server";
import { getTerritories, getGovernmentOptions } from "@/lib/actions/organizations";
import { Header } from "@/components/layout/header";
import { GovernmentForm } from "@/components/crm/government-form";

export default async function NewGovernmentPage() {
  const profile = await getProfile();
  const [territories, governmentOptions] = await Promise.all([
    getTerritories(),
    getGovernmentOptions(),
  ]);

  return (
    <>
      <Header profile={profile!} title="Add Government" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <GovernmentForm territories={territories} governmentOptions={governmentOptions} />
      </main>
    </>
  );
}
