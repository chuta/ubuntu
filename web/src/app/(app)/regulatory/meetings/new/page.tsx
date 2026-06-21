import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import {
  getRegulatorOrganizationOptions,
  getRegulatoryDealOptions,
} from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { MeetingForm } from "@/components/regulatory/meeting-form";

export default async function NewMeetingPage() {
  const profile = await getProfile();
  const [territories, organizations, deals] = await Promise.all([
    getTerritories(),
    getRegulatorOrganizationOptions(),
    getRegulatoryDealOptions(),
  ]);

  return (
    <>
      <Header profile={profile!} title="New Regulatory Meeting" />
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Create Regulatory Meeting</h2>
        <MeetingForm territories={territories} organizations={organizations} deals={deals} />
      </main>
    </>
  );
}
