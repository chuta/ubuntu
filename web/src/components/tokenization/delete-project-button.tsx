"use client";

import { useRouter } from "next/navigation";
import { deleteTokenizationProject } from "@/lib/actions/tokenization";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteTokenizationProject(id);
      router.push("/tokenization");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
      <Trash2 className="mr-1.5 h-4 w-4" />
      Delete
    </Button>
  );
}
