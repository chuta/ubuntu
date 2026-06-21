"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  convertEventLeadToDeal,
  createEventLead,
  updateEventLeadStatus,
} from "@/lib/actions/events";
import { LEAD_QUALITIES, leadQualityVariant, labelFor } from "@/lib/constants/events";
import type { EventLead } from "@/types/events";

type ContactOption = { id: string; first_name: string; last_name: string; organization_id: string | null };
type OrgOption = { id: string; name: string };

export function EventLeadsPanel({
  eventId,
  leads,
  contacts,
  organizations,
}: {
  eventId: string;
  leads: EventLead[];
  contacts: ContactOption[];
  organizations: OrgOption[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createEventLead(eventId, {
        contact_id: (fd.get("contact_id") as string) || undefined,
        organization_id: (fd.get("organization_id") as string) || undefined,
        lead_quality: (fd.get("lead_quality") as EventLead["lead_quality"]) || undefined,
        notes: (fd.get("notes") as string) || undefined,
      });
      setShowForm(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add lead");
    } finally {
      setLoading(false);
    }
  }

  async function handleConvert(leadId: string) {
    if (!confirm("Create a deal from this lead?")) return;
    setLoading(true);
    try {
      const dealId = await convertEventLeadToDeal(leadId, eventId);
      router.push(`/pipeline/${dealId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to convert lead");
      setLoading(false);
    }
  }

  async function handleStatus(leadId: string, status: EventLead["follow_up_status"]) {
    await updateEventLeadStatus(leadId, eventId, status);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Event Leads</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Lead"}
        </Button>
      </div>
      <div className="p-5">
        {showForm && (
          <form onSubmit={handleAdd} className="mb-4 space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <Select name="organization_id" defaultValue="">
              <option value="">Organization (optional)</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </Select>
            <Select name="contact_id" defaultValue="">
              <option value="">Contact (optional)</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </Select>
            <Select name="lead_quality" defaultValue="">
              <option value="">Quality</option>
              {LEAD_QUALITIES.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </Select>
            <Textarea name="notes" rows={2} placeholder="Notes" />
            <Button type="submit" size="sm" disabled={loading}>Save Lead</Button>
          </form>
        )}

        {leads.length === 0 ? (
          <p className="text-sm text-gray-400">No leads captured yet.</p>
        ) : (
          <ul className="space-y-3">
            {leads.map((lead) => (
              <li key={lead.id} className="rounded-lg border border-gray-100 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {lead.lead_quality && (
                    <Badge variant={leadQualityVariant(lead.lead_quality)}>
                      {labelFor(LEAD_QUALITIES, lead.lead_quality)}
                    </Badge>
                  )}
                  <Badge variant={lead.follow_up_status === "CONVERTED" ? "green" : "default"}>
                    {lead.follow_up_status}
                  </Badge>
                </div>
                <p className="mt-1 text-gray-900">
                  {lead.organization?.name ??
                    (lead.contact ? `${lead.contact.first_name} ${lead.contact.last_name}` : "Unknown")}
                </p>
                {lead.notes && <p className="mt-1 text-gray-500">{lead.notes}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {lead.deal_id ? (
                    <Link href={`/pipeline/${lead.deal_id}`} className="text-brand-purple hover:underline">
                      View deal →
                    </Link>
                  ) : lead.organization_id && lead.follow_up_status !== "CONVERTED" ? (
                    <Button size="sm" variant="outline" disabled={loading} onClick={() => handleConvert(lead.id)}>
                      Convert to Deal
                    </Button>
                  ) : null}
                  {lead.follow_up_status === "PENDING" && (
                    <Button size="sm" variant="ghost" onClick={() => handleStatus(lead.id, "CONTACTED")}>
                      Mark Contacted
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
