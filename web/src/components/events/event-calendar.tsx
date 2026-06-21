import Link from "next/link";
import { EVENT_TYPES, labelFor } from "@/lib/constants/events";
import type { Event } from "@/types/events";

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function startWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function EventCalendar({ events, month }: { events: Event[]; month: string }) {
  const [y, m] = month.split("-").map(Number);
  const year = y;
  const monthIdx = m - 1;
  const totalDays = daysInMonth(year, monthIdx);
  const startPad = startWeekday(year, monthIdx);

  const byDate: Record<string, Event[]> = {};
  for (const e of events) {
    const key = e.start_date.slice(0, 10);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(e);
  }

  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Date(year, monthIdx, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const prev = monthIdx === 0 ? `${year - 1}-12` : `${year}-${String(monthIdx).padStart(2, "0")}`;
  const next = monthIdx === 11 ? `${year + 1}-01` : `${year}-${String(monthIdx + 2).padStart(2, "0")}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{monthLabel}</h3>
        <div className="flex gap-2 text-sm">
          <Link href={`/events?view=calendar&month=${prev}`} className="text-brand-purple hover:underline">← Prev</Link>
          <Link href={`/events?view=calendar&month=${next}`} className="text-brand-purple hover:underline">Next →</Link>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-gray-50 px-2 py-1.5 text-center font-medium text-gray-500">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="min-h-[72px] bg-white" />;
          }
          const dateKey = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = byDate[dateKey] ?? [];
          return (
            <div key={dateKey} className="min-h-[72px] bg-white p-1">
              <span className="text-gray-500">{day}</span>
              <div className="mt-0.5 space-y-0.5">
                {dayEvents.slice(0, 2).map((e) => (
                  <Link
                    key={e.id}
                    href={`/events/${e.id}`}
                    className="block truncate rounded bg-brand-purple/10 px-1 py-0.5 text-[10px] text-brand-purple hover:bg-brand-purple/20"
                    title={e.name}
                  >
                    {e.name}
                  </Link>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-gray-400">+{dayEvents.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Event types: {EVENT_TYPES.map((t) => labelFor(EVENT_TYPES, t.value)).slice(0, 3).join(", ")}…
      </p>
    </div>
  );
}
