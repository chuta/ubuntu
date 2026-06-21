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
      <main className="flex-1 overflow-y-auto p-6">
        <DealForm organizations={organizations} products={products} />
      </main>
    </>
  );
}
