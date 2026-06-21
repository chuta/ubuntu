import Link from "next/link";
import { InfluenceGraph } from "@/components/influence/influence-graph";
import { RelationshipPanel } from "@/components/influence/relationship-panel";
import { StakeholderMapPanel } from "@/components/influence/stakeholder-map-panel";
import type { InfluenceGraphData } from "@/types/influence";
import type { Contact } from "@/types/crm";
import { Network } from "lucide-react";

export function DealInfluencePanel({
  dealId,
  organizationId,
  graphData,
  contacts,
}: {
  dealId: string;
  organizationId: string;
  graphData: InfluenceGraphData;
  contacts: Contact[];
}) {
  const paths = [`/pipeline/${dealId}`];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-brand-purple" />
          <h2 className="text-base font-semibold text-gray-900">Influence Graph</h2>
        </div>
        <Link href={`/influence?deal_id=${dealId}`} className="text-sm text-brand-purple hover:underline">
          Open full graph →
        </Link>
      </div>

      <InfluenceGraph nodes={graphData.nodes} edges={graphData.edges} />

      <StakeholderMapPanel
        dealId={dealId}
        organizationId={organizationId}
        maps={graphData.stakeholderMaps}
        contacts={contacts}
        revalidatePaths={paths}
      />

      <RelationshipPanel
        relationships={graphData.edges}
        contacts={contacts.map((c) => ({
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          organization_id: c.organization_id,
        }))}
        dealId={dealId}
        organizationId={organizationId}
        revalidatePaths={paths}
      />
    </div>
  );
}
