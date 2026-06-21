"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteKnowledgeAsset } from "@/lib/actions/knowledge";
import { Trash2 } from "lucide-react";

export function DeleteKnowledgeButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${title}" from the vault?`)) return;
    await deleteKnowledgeAsset(id);
    router.push("/knowledge");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
      <Trash2 className="mr-1.5 h-4 w-4" />
      Delete
    </Button>
  );
}
