"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { softDeleteDeal } from "@/lib/actions/deals";
import { Trash2 } from "lucide-react";

export function DeleteDealButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete deal "${name}"? This cannot be undone.`)) return;
    await softDeleteDeal(id);
    router.push("/pipeline");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
      <Trash2 className="mr-1.5 h-4 w-4" />
      Delete
    </Button>
  );
}
