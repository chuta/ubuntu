import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import { getConsultation, deleteConsultation } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ConsultationDetail } from "@/components/regulatory/consultation-components";
import { DeleteRegulatoryButton } from "@/components/regulatory/delete-regulatory-button";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function ConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();
  const consultation = await getConsultation(id);
  if (!consultation) notFound();

  return (
    <>
      <Header profile={profile!} title={consultation.title} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/regulatory/consultations" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />Back to Consultations
          </Link>
          <div className="flex gap-2">
            <Link href={`/regulatory/consultations/${id}/edit`}><Button variant="outline" size="sm"><Pencil className="mr-1.5 h-4 w-4" />Edit</Button></Link>
            <DeleteRegulatoryButton name={consultation.title} redirectTo="/regulatory/consultations" onDelete={deleteConsultation.bind(null, id)} />
          </div>
        </div>
        <ConsultationDetail consultation={consultation} />
      </main>
    </>
  );
}
