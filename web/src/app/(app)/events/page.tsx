import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getEvents } from "@/lib/actions/events";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { EventFilters } from "@/components/events/event-filters";
import { EventTable } from "@/components/events/event-table";
import { EventCalendar } from "@/components/events/event-calendar";
import { CalendarImportPanel } from "@/components/events/calendar-import-panel";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ event_type?: string; search?: string; view?: string; month?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const view = params.view ?? "list";
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const month = params.month ?? defaultMonth;

  const [y, m] = month.split("-").map(Number);
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const events = await getEvents({
    event_type: params.event_type,
    search: params.search,
    ...(view === "calendar" ? { from, to } : {}),
  });

  return (
    <>
      <Header profile={profile!} title="Events & Conferences" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <PageHeader
          title="Events & Conferences"
          description="Lead capture, calendar view, Google Calendar import"
          actionHref="/events/new"
          actionLabel="New Event"
        />
        <Suspense fallback={null}>
          <CalendarImportPanel />
        </Suspense>
        <div className="mt-4 flex gap-2 text-sm">
          <a
            href={`/events?view=list${params.search ? `&search=${params.search}` : ""}`}
            className={view === "list" ? "font-medium text-brand-purple" : "text-gray-500 hover:text-brand-purple"}
          >
            List
          </a>
          <span className="text-gray-300">|</span>
          <a
            href={`/events?view=calendar&month=${month}`}
            className={view === "calendar" ? "font-medium text-brand-purple" : "text-gray-500 hover:text-brand-purple"}
          >
            Calendar
          </a>
        </div>
        <Suspense>
          <EventFilters />
        </Suspense>
        {view === "calendar" ? (
          <EventCalendar events={events} month={month} />
        ) : (
          <EventTable events={events} />
        )}
      </main>
    </>
  );
}
