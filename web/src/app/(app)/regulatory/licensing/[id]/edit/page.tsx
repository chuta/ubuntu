import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import {
  getLicensingConversation,
  getRegulatorOrganizationOptions,
  getRegulatoryContactOptions,
  getRegulatoryDealOptions,
} from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { LicensingForm } from "@/components/regulatory/licensing-form";

export default async function EditLicensingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();
  const [conversation, territories, organizations, contacts, deals] = await Promise.all([
    getLicensingConversation(id),
    getTerritories(),
    getRegulatorOrganizationOptions(),
    getRegulatoryContactOptions(),
    getRegulatoryDealOptions(),
  ]);
  if (!conversation) notFound();

  return (
    <>
      <Header profile={profile!} title={`Edit — ${conversation.title}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Edit Licensing Conversation</h2>
        <LicensingForm territories={territories} organizations={organizations} contacts={contacts} deals={deals} conversation={conversation} />
      </main>
    </>
  );
}
