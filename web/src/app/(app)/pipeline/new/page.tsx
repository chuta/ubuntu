import { getProfile } from "@/lib/supabase/server";
import { getOrganizationOptions, getProducts } from "@/lib/actions/deals";
import { Header } from "@/components/layout/header";
import { DealForm } from "@/components/pipeline/deal-form";

export default async function NewDealPage() {
  const profile = await getProfile();
  const [organizations, products] = await Promise.all([
    getOrganizationOptions(),
    getProducts(),
  ]);

  return (
    <>
      <Header profile={profile!} title="New Deal" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <DealForm organizations={organizations} products={products} />
      </main>
    </>
  );
}
