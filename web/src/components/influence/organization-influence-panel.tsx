import Link from "next/link";
import { InfluenceGraph } from "@/components/influence/influence-graph";
import { RelationshipPanel } from "@/components/influence/relationship-panel";
import type { InfluenceGraphData } from "@/types/influence";
import type { Contact } from "@/types/crm";
import { labelFor, RELATIONSHIP_TYPES } from "@/lib/constants/influence";
import { Network } from "lucide-react";

export function OrganizationInfluencePanel({
  organizationId,
  graphData,
  contacts,
  basePath,
}: {
  organizationId: string;
  graphData: InfluenceGraphData;
  contacts: Contact[];
  basePath: string;
}) {
  const reportsToEdges = graphData.edges.filter((e) => e.relationship_type === "REPORTS_TO");
  const paths = [basePath];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-brand-purple" />
          <h2 className="text-base font-semibold text-gray-900">Influence Network</h2>
        </div>
        <Link href={`/influence?organization_id=${organizationId}`} className="text-sm text-brand-purple hover:underline">
          Open full graph →
        </Link>
      </div>

      <InfluenceGraph nodes={graphData.nodes} edges={graphData.edges} />

      {reportsToEdges.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Reporting Hierarchy</h3>
          <ul className="space-y-2 text-sm">
            {reportsToEdges.map((e) => (
              <li key={e.id} className="text-gray-700">
                <span className="font-medium">{e.source?.first_name} {e.source?.last_name}</span>
                <span className="mx-2 text-gray-400">{labelFor(RELATIONSHIP_TYPES, "REPORTS_TO").toLowerCase()}</span>
                <span className="font-medium">{e.target?.first_name} {e.target?.last_name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RelationshipPanel
        relationships={graphData.edges}
        contacts={contacts.map((c) => ({
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          organization_id: c.organization_id,
        }))}
        organizationId={organizationId}
        revalidatePaths={paths}
      />
    </div>
  );
}
