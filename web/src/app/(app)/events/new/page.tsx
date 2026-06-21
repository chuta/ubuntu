import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { Header } from "@/components/layout/header";
import { EventForm } from "@/components/events/event-form";

export default async function NewEventPage() {
  const profile = await getProfile();
  const territories = await getTerritories();

  return (
    <>
      <Header profile={profile!} title="New Event" />
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Create Event</h2>
        <EventForm territories={territories} />
      </main>
    </>
  );
}
