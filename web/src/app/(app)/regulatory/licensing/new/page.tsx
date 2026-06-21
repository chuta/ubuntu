import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import {
  getRegulatorOrganizationOptions,
  getRegulatoryContactOptions,
  getRegulatoryDealOptions,
} from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { LicensingForm } from "@/components/regulatory/licensing-form";

export default async function NewLicensingPage() {
  const profile = await getProfile();
  const [territories, organizations, contacts, deals] = await Promise.all([
    getTerritories(),
    getRegulatorOrganizationOptions(),
    getRegulatoryContactOptions(),
    getRegulatoryDealOptions(),
  ]);

  return (
    <>
      <Header profile={profile!} title="New Licensing Conversation" />
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Create Licensing Conversation</h2>
        <LicensingForm territories={territories} organizations={organizations} contacts={contacts} deals={deals} />
      </main>
    </>
  );
}
