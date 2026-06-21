import { Header } from "@/components/layout/header";
import { getProfile } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <>
      <Header profile={profile!} title="Settings" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your GrowthOS account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {profile?.full_name}</p>
              <p><span className="text-gray-500">Email:</span> {profile?.email}</p>
              <p><span className="text-gray-500">Role:</span> {profile?.role}</p>
            </CardContent>
          </Card>

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
