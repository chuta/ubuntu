import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import {
  getMeeting,
  getRegulatorOrganizationOptions,
  getRegulatoryDealOptions,
} from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { MeetingForm } from "@/components/regulatory/meeting-form";

export default async function EditMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();

  const [meeting, territories, organizations, deals] = await Promise.all([
    getMeeting(id),
    getTerritories(),
    getRegulatorOrganizationOptions(),
    getRegulatoryDealOptions(),
  ]);

  if (!meeting) notFound();

  return (
    <>
      <Header profile={profile!} title={`Edit — ${meeting.title}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Edit Regulatory Meeting</h2>
        <MeetingForm
          territories={territories}
          organizations={organizations}
          deals={deals}
          meeting={meeting}
        />
      </main>
    </>
  );
}
