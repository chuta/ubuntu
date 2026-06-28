import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { AccountInactive } from "@/components/layout/account-inactive";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.is_active) {
    return <AccountInactive email={profile.email} />;
  }

  return <AppShell profile={profile}>{children}</AppShell>;
}

export async function generateMetadata() {
  return { title: "Ubuntu GrowthOS" };
}
