import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return <AppShell profile={profile}>{children}</AppShell>;
}

export async function generateMetadata() {
  return { title: "Ubuntu GrowthOS" };
}
