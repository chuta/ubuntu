import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import {
  getPartnership,
  getPartnershipMembers,
  getDealOptions,
} from "@/lib/actions/partnerships";
import { getOrganizationOptions } from "@/lib/actions/deals";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { PartnershipDetail } from "@/components/partnerships/partnership-detail";
import { PartnershipDealLinkPanel } from "@/components/partnerships/partnership-deal-link-panel";
import { PartnershipMembersPanel } from "@/components/partnerships/partnership-members-panel";
import { DeletePartnershipButton } from "@/components/partnerships/delete-partnership-button";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function PartnershipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();

  const [partnership, members, deals, organizations] = await Promise.all([
    getPartnership(id),
    getPartnershipMembers(id),
    getDealOptions(),
    getOrganizationOptions(),
  ]);

  if (!partnership) notFound();

  return (
    <>
      <Header profile={profile!} title={partnership.name} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/partnerships" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Partnerships
          </Link>
          <div className="flex gap-2">
            <Link href={`/partnerships/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeletePartnershipButton id={id} name={partnership.name} />
          </div>
        </div>

        <div className="space-y-6">
          <PartnershipDetail partnership={partnership} />
          <div className="grid gap-6 lg:grid-cols-2">
            <PartnershipDealLinkPanel partnership={partnership} deals={deals} />
            <PartnershipMembersPanel
              partnershipId={id}
              members={members}
              organizations={organizations}
            />
          </div>
        </div>
      </main>
    </>
  );
}
