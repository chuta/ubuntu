"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ASSIGNABLE_ROLES } from "@/lib/auth/roles";
import { inviteTeamMember } from "@/lib/actions/team";
import type { UserRole } from "@/types/database";

export function TeamInvite() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("COMMERCIAL");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fallbackLink, setFallbackLink] = useState<string | null>(null);

  const activeRole = ASSIGNABLE_ROLES.find((r) => r.value === role);

  function reset() {
    setEmail("");
    setFullName("");
    setRole("COMMERCIAL");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFallbackLink(null);
    const invitedEmail = email.trim().toLowerCase();
    startTransition(async () => {
      try {
        const result = await inviteTeamMember({ email, fullName, role });
        if (result.emailSent) {
          setSuccess(`Invitation email sent to ${invitedEmail} from GrowthOS Buddy.`);
        } else {
          setSuccess(`Invite created for ${invitedEmail}, but the email could not be sent. Copy the link below.`);
          setFallbackLink(result.inviteUrl ?? null);
        }
        reset();
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not send the invite");
      }
    });
  }

  if (!open) {
    return (
      <div className="space-y-3">
        {success && (
          <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <p>{success}</p>
            {fallbackLink && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  readOnly
                  value={fallbackLink}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full rounded-md border border-green-200 bg-white px-2 py-1.5 text-xs text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(fallbackLink)}
                  className="shrink-0 rounded-md bg-green-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-800"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <p className="text-sm text-gray-600">
            Invite a teammate by email. They&apos;ll receive an email to set a password and join.
          </p>
          <Button type="button" size="sm" onClick={() => { setOpen(true); setSuccess(null); }}>
            <UserPlus className="mr-1.5 h-4 w-4" /> Invite member
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Invite a team member</h3>
        <button
          type="button"
          onClick={() => { setOpen(false); reset(); }}
          className="text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="invite-name" className="mb-1 block text-sm font-medium text-gray-700">
            Full name
          </label>
          <Input
            id="invite-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            required
            disabled={pending}
          />
        </div>
        <div>
          <label htmlFor="invite-email" className="mb-1 block text-sm font-medium text-gray-700">
            Work email
          </label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@ubuntu.tribe"
            required
            disabled={pending}
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <label htmlFor="invite-role" className="mb-1 block text-sm font-medium text-gray-700">
          Role
        </label>
        <Select
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disabled={pending}
          className="sm:w-64"
        >
          {ASSIGNABLE_ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </Select>
        {activeRole && (
          <p className="mt-1.5 text-xs text-gray-500">{activeRole.description}</p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Sending invite…" : "Send invite"}
        </Button>
        <p className="text-xs text-gray-400">
          Invited users stay inactive until they set a password and sign in for the first time.
        </p>
      </div>
    </form>
  );
}
