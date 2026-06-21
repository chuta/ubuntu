"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { softDeleteOrganization } from "@/lib/actions/organizations";
import { Trash2 } from "lucide-react";

export function DeleteOrganizationButton({
  id,
  name,
  basePath,
}: {
  id: string;
  name: string;
  basePath: "/governments" | "/accounts";
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await softDeleteOrganization(id, basePath);
    router.push(basePath);
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
      <Trash2 className="mr-1.5 h-4 w-4" />
      Delete
    </Button>
  );
}
