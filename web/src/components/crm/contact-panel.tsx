"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/crm/form-field";
import { createContact, deleteContact } from "@/lib/actions/contacts";
import { CONTACT_ROLES, INFLUENCE_LEVELS, labelFor } from "@/lib/constants/organizations";
import type { Contact } from "@/types/crm";
import { Mail, Phone, Plus, Trash2, User } from "lucide-react";

export function ContactPanel({
  organizationId,
  contacts,
  basePath,
}: {
  organizationId: string;
  contacts: Contact[];
  basePath: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    try {
      await createContact(
        organizationId,
        {
          first_name: fd.get("first_name") as string,
          last_name: fd.get("last_name") as string,
          title: (fd.get("title") as string) || undefined,
          department: (fd.get("department") as string) || undefined,
          email: (fd.get("email") as string) || undefined,
          phone: (fd.get("phone") as string) || undefined,
          linkedin_url: (fd.get("linkedin_url") as string) || undefined,
          contact_role: (fd.get("contact_role") as Contact["contact_role"]) || undefined,
          influence_level: (fd.get("influence_level") as Contact["influence_level"]) || undefined,
          is_primary: fd.get("is_primary") === "on",
          notes: (fd.get("notes") as string) || undefined,
        },
        basePath
      );
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contact");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(contactId: string) {
    if (!confirm("Remove this contact?")) return;
    await deleteContact(contactId, basePath);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Contacts</h3>
          <p className="text-xs text-gray-500">{contacts.length} stakeholder{contacts.length !== 1 ? "s" : ""}</p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Contact
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border-b border-gray-200 bg-gray-50 p-5">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="First Name" htmlFor="first_name" required>
              <Input id="first_name" name="first_name" required />
            </FormField>
            <FormField label="Last Name" htmlFor="last_name" required>
              <Input id="last_name" name="last_name" required />
            </FormField>
            <FormField label="Title" htmlFor="title">
              <Input id="title" name="title" />
            </FormField>
            <FormField label="Department" htmlFor="department">
              <Input id="department" name="department" />
            </FormField>
            <FormField label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" />
            </FormField>
            <FormField label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" type="tel" />
            </FormField>
            <FormField label="LinkedIn" htmlFor="linkedin_url">
              <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/…" />
            </FormField>
            <FormField label="Role" htmlFor="contact_role">
              <Select id="contact_role" name="contact_role">
                <option value="">Not set</option>
                {CONTACT_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Influence" htmlFor="influence_level">
              <Select id="influence_level" name="influence_level">
                <option value="">Not set</option>
                {INFLUENCE_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Notes" htmlFor="notes" className="sm:col-span-2">
              <Textarea id="notes" name="notes" rows={2} />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
              <input type="checkbox" name="is_primary" className="rounded border-gray-300" />
              Primary contact
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Adding…" : "Add Contact"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {contacts.length === 0 && !showForm ? (
        <div className="p-8 text-center text-sm text-gray-500">
          No contacts yet. Add stakeholders to track relationships.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {contacts.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-purple/10">
                  <User className="h-4 w-4 text-brand-purple" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {c.first_name} {c.last_name}
                    </span>
                    {c.is_primary && <Badge variant="purple">Primary</Badge>}
                    {c.contact_role && (
                      <Badge variant="default">{labelFor(CONTACT_ROLES, c.contact_role)}</Badge>
                    )}
                  </div>
                  {c.title && <p className="text-sm text-gray-600">{c.title}{c.department ? ` · ${c.department}` : ""}</p>}
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-brand-purple">
                        <Mail className="h-3 w-3" />{c.email}
                      </a>
                    )}
                    {c.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />{c.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-red-600"
                onClick={() => handleDelete(c.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
