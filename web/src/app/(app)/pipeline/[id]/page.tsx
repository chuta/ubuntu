import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import {
  getDeal,
  getStageHistory,
  getProfileOptions,
} from "@/lib/actions/deals";
import { getActivities } from "@/lib/actions/activities";
import { getTasks } from "@/lib/actions/tasks";
import { getNotes } from "@/lib/actions/notes";
import { getContacts } from "@/lib/actions/contacts";
import { getInfluenceGraphData } from "@/lib/actions/influence";
import { getPartnershipByDealId, getPartnershipOptions } from "@/lib/actions/partnerships";
import { DealInfluencePanel } from "@/components/influence/deal-influence-panel";
import { getTokenizationProjectByDeal, getTokenizationProjectOptions } from "@/lib/actions/tokenization";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { DealDetailSummary } from "@/components/pipeline/deal-detail-summary";
import { DealNudgesBanner } from "@/components/pipeline/deal-nudges-banner";
import { computeDealNudges } from "@/lib/deal-nudges";
import { DealCommercialRisksPanel } from "@/components/pipeline/deal-commercial-risks-panel";
import { DealQualificationPanel } from "@/components/pipeline/deal-qualification-panel";
import { getCommercialRiskSuggestions } from "@/lib/actions/commercial-risks";
import { ActivityPanel } from "@/components/pipeline/activity-panel";
import { TaskPanel } from "@/components/pipeline/task-panel";
import { NotePanel } from "@/components/pipeline/note-panel";
import { StageHistoryPanel } from "@/components/pipeline/stage-history-panel";
import { DealPartnershipPanel } from "@/components/partnerships/deal-partnership-panel";
import { DealTokenizationPanel } from "@/components/tokenization/deal-tokenization-panel";
import { DeleteDealButton } from "@/components/pipeline/delete-deal-button";
import { ArrowLeft, Pencil } from "lucide-react";
import type { DealStageHistory } from "@/types/pipeline";
import type { WorkspaceContext } from "@/lib/workspace-context";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();

  const dealData = await getDeal(id);
  if (!dealData) notFound();

  const workspace: WorkspaceContext = {
    kind: "deal",
    id,
    organizationId: dealData.organization_id,
  };

  const [activities, tasks, notes, history, profiles, partnership, partnershipOptions, tokenizationProject, tokenizationOptions, contacts, influenceGraph, riskSuggestions] = await Promise.all([
    getActivities(workspace),
    getTasks(workspace),
    getNotes(workspace),
    getStageHistory(id),
    getProfileOptions(),
    getPartnershipByDealId(id),
    getPartnershipOptions(),
    getTokenizationProjectByDeal(id),
    getTokenizationProjectOptions(),
    getContacts(dealData.organization_id),
    getInfluenceGraphData({ deal_id: id }),
    getCommercialRiskSuggestions(id),
  ]);

  const deal = dealData;
  const nudges = computeDealNudges({
    stage: deal.stage,
    created_at: deal.created_at,
    last_activity_at: activities[0]?.occurred_at ?? null,
    commercial_risk_review_date: deal.commercial_risk_review_date,
    expected_close_date: deal.expected_close_date,
  });

  return (
    <>
      <Header profile={profile!} title={deal.name} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/pipeline" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Pipeline
          </Link>
          <div className="flex gap-2">
            <Link href={`/pipeline/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeleteDealButton id={id} name={deal.name} />
          </div>
        </div>

        <div className="space-y-6">
          <DealNudgesBanner nudges={nudges} />
          <DealDetailSummary deal={deal} />
          <DealQualificationPanel deal={deal} />
          <DealCommercialRisksPanel deal={deal} suggestions={riskSuggestions} />
          <DealPartnershipPanel
            dealId={id}
            partnership={partnership}
            partnershipOptions={partnershipOptions}
          />
          <DealTokenizationPanel
            dealId={id}
            project={tokenizationProject}
            projectOptions={tokenizationOptions}
          />
          <DealInfluencePanel
            dealId={id}
            organizationId={deal.organization_id}
            graphData={influenceGraph}
            contacts={contacts}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ActivityPanel workspace={workspace} activities={activities} />
            <TaskPanel workspace={workspace} tasks={tasks} profiles={profiles} />
          </div>
          <NotePanel workspace={workspace} notes={notes} />
          <StageHistoryPanel history={history as DealStageHistory[]} />
        </div>
      </main>
    </>
  );
}
