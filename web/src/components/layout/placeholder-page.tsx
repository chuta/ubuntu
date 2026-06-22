import { Header } from "@/components/layout/header";
import { getProfile } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PlaceholderPage({
  title,
  description,
  week,
}: {
  title: string;
  description: string;
  week: string;
}) {
  const profile = await getProfile();

  return (
    <>
      <Header profile={profile!} title={title} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
              Shipping {week} — schema ready in Supabase
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
