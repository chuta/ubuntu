import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getPartnership, getDealOptions } from "@/lib/actions/partnerships";
import { getOrganizationOptions } from "@/lib/actions/deals";
import { Header } from "@/components/layout/header";
import { PartnershipForm } from "@/components/partnerships/partnership-form";

export default async function EditPartnershipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const [partnership, organizations, deals] = await Promise.all([
    getPartnership(id),
    getOrganizationOptions(),
    getDealOptions(),
  ]);

  if (!partnership) notFound();

  return (
    <>
      <Header profile={profile!} title={`Edit ${partnership.name}`} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <PartnershipForm organizations={organizations} deals={deals} partnership={partnership} />
      </main>
    </>
  );
}
