"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deletePartnership } from "@/lib/actions/partnerships";
import { Trash2 } from "lucide-react";

export function DeletePartnershipButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete partnership "${name}"? This cannot be undone.`)) return;
    await deletePartnership(id);
    router.push("/partnerships");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
      <Trash2 className="mr-1.5 h-4 w-4" />
      Delete
    </Button>
  );
}
