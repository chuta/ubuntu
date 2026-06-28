import Link from "next/link";
import type { Activity, Deal, Note } from "@/types/pipeline";
import type { Document } from "@/types/documents";
import type { Contact } from "@/types/crm";
import { ACTIVITY_TYPES, stageLabel } from "@/lib/constants/deals";
import { DOCUMENT_TYPES, labelFor } from "@/lib/constants/documents";
import {
  CalendarClock,
  FileText,
  GitBranch,
  StickyNote,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

type TimelineEvent = {
  id: string;
  date: string;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  meta: string;
  href?: string;
};

export function OrganizationTimelinePanel({
  activities,
  documents,
  notes,
  contacts,
  deals,
  limit = 12,
}: {
  activities: Activity[];
  documents: Document[];
  notes: Note[];
  contacts: Contact[];
  deals: Deal[];
  limit?: number;
}) {
  const events: TimelineEvent[] = [];

  for (const a of activities) {
    events.push({
      id: `activity-${a.id}`,
      date: a.occurred_at,
      icon: CalendarClock,
      iconColor: "text-brand-purple",
      title: a.subject,
      meta: `${ACTIVITY_TYPES.find((t) => t.value === a.activity_type)?.label ?? "Activity"}${
        a.logged_by?.full_name ? ` · ${a.logged_by.full_name}` : ""
      }`,
    });
  }

  for (const d of documents) {
    events.push({
      id: `document-${d.id}`,
      date: d.created_at,
      icon: FileText,
      iconColor: "text-brand-gold",
      title: d.title,
      meta: `Document · ${labelFor(DOCUMENT_TYPES, d.document_type)}`,
      href: `/documents/${d.id}`,
    });
  }

  for (const n of notes) {
    events.push({
      id: `note-${n.id}`,
      date: n.created_at,
      icon: StickyNote,
      iconColor: "text-gray-500",
      title: n.body.length > 90 ? `${n.body.slice(0, 90)}…` : n.body,
      meta: `Note${n.author?.full_name ? ` · ${n.author.full_name}` : ""}`,
    });
  }

  for (const c of contacts) {
    events.push({
      id: `contact-${c.id}`,
      date: c.created_at,
      icon: UserPlus,
      iconColor: "text-brand-purple",
      title: `${c.first_name} ${c.last_name}`,
      meta: "Contact added",
    });
  }

  for (const deal of deals) {
    events.push({
      id: `deal-${deal.id}`,
      date: deal.created_at,
      icon: GitBranch,
      iconColor: "text-brand-gold",
      title: deal.name,
      meta: `Deal created · ${stageLabel(deal.stage)}`,
      href: `/pipeline/${deal.id}`,
    });
  }

  const sorted = events
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <p className="text-xs text-gray-500">
          Unified timeline of activities, documents, notes, deals, and contacts
        </p>
      </div>
      {sorted.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-500">No recent activity yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {sorted.map((e) => {
            const Icon = e.icon;
            return (
              <li key={e.id} className="flex gap-3 px-5 py-4">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${e.iconColor}`} />
                <div className="min-w-0 flex-1">
                  {e.href ? (
                    <Link href={e.href} className="font-medium text-gray-900 hover:text-brand-purple">
                      {e.title}
                    </Link>
                  ) : (
                    <p className="font-medium text-gray-900">{e.title}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {e.meta} · {new Date(e.date).toLocaleDateString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
