"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { linkDealPartnership } from "@/lib/actions/partnerships";
import {
  labelFor,
  PARTNERSHIP_STATUSES,
  partnershipStatusVariant,
} from "@/lib/constants/partnerships";
import { Badge } from "@/components/ui/badge";
import type { Partnership } from "@/types/partnerships";
import { Handshake } from "lucide-react";

export function DealPartnershipPanel({
  dealId,
  partnership,
  partnershipOptions,
}: {
  dealId: string;
  partnership: Partnership | null;
  partnershipOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [partnershipId, setPartnershipId] = useState(partnership?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await linkDealPartnership(dealId, partnershipId || null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to link partnership");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Linked Partnership</h3>
      </div>
      <div className="p-5">
        {partnership && (
          <div className="mb-4 rounded-lg border border-brand-gold/20 bg-brand-gold/5 p-4">
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-brand-gold" />
              <Link href={`/partnerships/${partnership.id}`} className="font-medium text-brand-purple hover:underline">
                {partnership.name}
              </Link>
              <Badge variant={partnershipStatusVariant(partnership.status)}>
                {labelFor(PARTNERSHIP_STATUSES, partnership.status)}
              </Badge>
            </div>
          </div>
        )}
        <Select value={partnershipId} onChange={(e) => setPartnershipId(e.target.value)}>
          <option value="">No partnership linked</option>
          {partnershipOptions.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
        <Button size="sm" className="mt-4" onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : "Save Link"}
        </Button>
      </div>
    </div>
  );
}
