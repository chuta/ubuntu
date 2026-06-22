import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import {
  getMeeting,
  getMeetingAttendees,
  getRegulatoryContactOptions,
  deleteMeeting,
} from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { MeetingDetail } from "@/components/regulatory/meeting-detail";
import { MeetingAttendeesPanel } from "@/components/regulatory/meeting-attendees-panel";
import { DeleteRegulatoryButton } from "@/components/regulatory/delete-regulatory-button";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();

  const [meeting, attendees, contacts] = await Promise.all([
    getMeeting(id),
    getMeetingAttendees(id),
    getRegulatoryContactOptions(),
  ]);

  if (!meeting) notFound();

  return (
    <>
      <Header profile={profile!} title={meeting.title} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/regulatory/meetings" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Meetings
          </Link>
          <div className="flex gap-2">
            <Link href={`/regulatory/meetings/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeleteRegulatoryButton
              name={meeting.title}
              redirectTo="/regulatory/meetings"
              onDelete={deleteMeeting.bind(null, id)}
            />
          </div>
        </div>
        <div className="space-y-6">
          <MeetingDetail meeting={meeting} />
          <MeetingAttendeesPanel meetingId={id} attendees={attendees} contacts={contacts} />
        </div>
      </main>
    </>
  );
}
