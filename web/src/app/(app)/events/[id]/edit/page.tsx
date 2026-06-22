import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getEvent } from "@/lib/actions/events";
import { getTerritories } from "@/lib/actions/organizations";
import { Header } from "@/components/layout/header";
import { EventForm } from "@/components/events/event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const [event, territories] = await Promise.all([getEvent(id), getTerritories()]);

  if (!event) notFound();

  return (
    <>
      <Header profile={profile!} title={`Edit — ${event.name}`} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Edit Event</h2>
        <EventForm territories={territories} event={event} />
      </main>
    </>
  );
}
