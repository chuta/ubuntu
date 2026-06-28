"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { ASSIGNABLE_ROLES } from "@/lib/auth/roles";
import {
  resendInvite,
  setUserActive,
  setUserManager,
  updateUserRole,
  type TeamMember,
} from "@/lib/actions/team";
import type { UserRole } from "@/types/database";

export function TeamTable({ members, currentUserId }: { members: TeamMember[]; currentUserId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resentId, setResentId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  function resend(member: TeamMember) {
    setError(null);
    setInviteLink(null);
    setBusyId(member.id);
    startTransition(async () => {
      try {
        const { link } = await resendInvite(member.id);
        setResentId(member.id);
        if (link) setInviteLink(link);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not resend the invite");
      } finally {
        setBusyId(null);
      }
    });
  }

  function run(id: string, fn: () => Promise<void>) {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      } finally {
        setBusyId(null);
      }
    });
  }

  const managerOptions = members.filter((m) => m.is_active);

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {inviteLink && (
        <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-medium">Email could not be sent automatically — share this link with the invitee:</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteLink}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-md border border-blue-200 bg-white px-2 py-1.5 text-xs text-gray-700"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(inviteLink)}
              className="shrink-0 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Reports to</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => {
              const isSelf = m.id === currentUserId;
              const rowBusy = pending && busyId === m.id;
              return (
                <tr key={m.id} className={rowBusy ? "opacity-50" : ""}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {m.full_name}
                      {isSelf && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      className="w-40"
                      value={m.role}
                      disabled={rowBusy}
                      onChange={(e) => run(m.id, () => updateUserRole(m.id, e.target.value as UserRole))}
                    >
                      {ASSIGNABLE_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                      {!ASSIGNABLE_ROLES.some((r) => r.value === m.role) && (
                        <option value={m.role}>{m.role}</option>
                      )}
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      className="w-44"
                      value={m.reports_to_id ?? ""}
                      disabled={rowBusy}
                      onChange={(e) => run(m.id, () => setUserManager(m.id, e.target.value || null))}
                    >
                      <option value="">No manager</option>
                      {managerOptions
                        .filter((o) => o.id !== m.id)
                        .map((o) => (
                          <option key={o.id} value={o.id}>{o.full_name}</option>
                        ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    {m.pending_invite ? (
                      <div className="flex items-center gap-3">
                        <Badge variant="gold">Invited</Badge>
                        <button
                          type="button"
                          disabled={rowBusy}
                          onClick={() => resend(m)}
                          className="text-xs font-medium text-brand-purple hover:underline disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
                        >
                          {rowBusy ? "Sending…" : resentId === m.id ? "Resent" : "Resend invite"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Badge variant={m.is_active ? "green" : "default"}>
                          {m.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <button
                          type="button"
                          disabled={rowBusy || isSelf}
                          onClick={() => run(m.id, () => setUserActive(m.id, !m.is_active))}
                          className="text-xs font-medium text-brand-purple hover:underline disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
                        >
                          {m.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
