import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import { getLicensingConversation, deleteLicensingConversation } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { LicensingDetail } from "@/components/regulatory/licensing-components";
import { DeleteRegulatoryButton } from "@/components/regulatory/delete-regulatory-button";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function LicensingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();
  const conversation = await getLicensingConversation(id);
  if (!conversation) notFound();

  return (
    <>
      <Header profile={profile!} title={conversation.title} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/regulatory/licensing" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />Back to Licensing
          </Link>
          <div className="flex gap-2">
            <Link href={`/regulatory/licensing/${id}/edit`}><Button variant="outline" size="sm"><Pencil className="mr-1.5 h-4 w-4" />Edit</Button></Link>
            <DeleteRegulatoryButton name={conversation.title} redirectTo="/regulatory/licensing" onDelete={deleteLicensingConversation.bind(null, id)} />
          </div>
        </div>
        <LicensingDetail conversation={conversation} />
      </main>
    </>
  );
}
