"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteDocument } from "@/lib/actions/documents";
import { Trash2 } from "lucide-react";

export function DeleteDocumentButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deleteDocument(id);
    router.push("/documents");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
      <Trash2 className="mr-1.5 h-4 w-4" />
      Delete
    </Button>
  );
}
