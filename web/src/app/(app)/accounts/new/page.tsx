import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { Header } from "@/components/layout/header";
import { AccountForm } from "@/components/crm/account-form";

export default async function NewAccountPage() {
  const profile = await getProfile();
  const territories = await getTerritories();

  return (
    <>
      <Header profile={profile!} title="Add Account" />
      <main className="flex-1 overflow-y-auto p-6">
        <AccountForm territories={territories} />
      </main>
    </>
  );
}
