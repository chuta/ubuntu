import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getDeal, getOrganizationOptions, getProducts } from "@/lib/actions/deals";
import { Header } from "@/components/layout/header";
import { DealForm } from "@/components/pipeline/deal-form";

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const [deal, organizations, products] = await Promise.all([
    getDeal(id),
    getOrganizationOptions(),
    getProducts(),
  ]);

  if (!deal) notFound();

  return (
    <>
      <Header profile={profile!} title={`Edit ${deal.name}`} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <DealForm organizations={organizations} products={products} deal={deal} />
      </main>
    </>
  );
}
