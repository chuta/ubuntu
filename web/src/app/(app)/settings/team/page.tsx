import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { getProfile } from "@/lib/supabase/server";
import { getTeamMembers } from "@/lib/actions/team";
import { TeamTable } from "@/components/settings/team-table";

export default async function TeamSettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/settings");

  const members = await getTeamMembers();
  const activeCount = members.filter((m) => m.is_active).length;
  const pendingCount = members.length - activeCount;

  return (
    <>
      <Header profile={profile} title="Team Management" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="h-4 w-4" /> Settings
          </Link>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Team members</h2>
            <p className="text-sm text-gray-500">
              {members.length} member{members.length === 1 ? "" : "s"} · {activeCount} active. Assign
              roles, set reporting lines, and control who can sign in. Managers can see records owned
              by their direct reports.
            </p>
          </div>

          {pendingCount > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="font-medium">{pendingCount}</span> account
              {pendingCount === 1 ? "" : "s"} awaiting activation. New sign-ups stay inactive until you
              approve them below.
            </div>
          )}

          <TeamTable members={members} currentUserId={profile.id} />
        </div>
      </main>
    </>
  );
}
