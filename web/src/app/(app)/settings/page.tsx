import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { getProfile } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canManageUsers, roleLabel } from "@/lib/auth/roles";

export default async function SettingsPage() {
  const profile = await getProfile();
  const isAdmin = canManageUsers(profile?.role);

  return (
    <>
      <Header profile={profile!} title="Settings" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your GrowthOS account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {profile?.full_name}</p>
              <p><span className="text-gray-500">Email:</span> {profile?.email}</p>
              <p><span className="text-gray-500">Role:</span> {roleLabel(profile?.role)}</p>
            </CardContent>
          </Card>

          {isAdmin && (
            <Link href="/settings/team" className="block">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-brand-purple" />
                      <CardTitle>Team Management</CardTitle>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <CardDescription>Manage members, roles, reporting lines and access</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Week 6+ — Google Calendar import</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">Google Calendar connection — coming Week 6</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ubuntu Tribe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <a href="https://utribe.one/" target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline">
                utribe.one — Corporate website
              </a>
              <br />
              <a href="https://gift.utribe.app" target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline">
                gift.utribe.app — GIFT Portal
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
