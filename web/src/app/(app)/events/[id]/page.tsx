import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import {
  getEvent,
  getEventLeads,
  getDealsBySourceEvent,
  getContactOptions,
  getOrganizationOptionsForEvents,
} from "@/lib/actions/events";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { EventDetail, EventSourceDeals } from "@/components/events/event-detail";
import { EventLeadsPanel } from "@/components/events/event-leads-panel";
import { DeleteEventButton } from "@/components/events/delete-event-button";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();

  const [event, leads, sourceDeals, contacts, organizations] = await Promise.all([
    getEvent(id),
    getEventLeads(id),
    getDealsBySourceEvent(id),
    getContactOptions(),
    getOrganizationOptionsForEvents(),
  ]);

  if (!event) notFound();

  return (
    <>
      <Header profile={profile!} title={event.name} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/events" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Events
          </Link>
          <div className="flex gap-2">
            <Link href={`/events/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeleteEventButton id={id} name={event.name} />
          </div>
        </div>

        <div className="space-y-6">
          <EventDetail event={event} />
          <EventLeadsPanel
            eventId={id}
            leads={leads}
            contacts={contacts}
            organizations={organizations}
          />
          <EventSourceDeals deals={sourceDeals} />
        </div>
      </main>
    </>
  );
}
