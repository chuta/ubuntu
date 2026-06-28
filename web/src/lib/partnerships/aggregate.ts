import { PARTNERSHIP_STATUSES } from "@/lib/constants/partnerships";
import type { PartnershipStatus } from "@/types/partnerships";

const OPEN_TASK_STATUSES = new Set(["OPEN", "IN_PROGRESS"]);
const OPEN_MILESTONE_STATUSES = new Set(["PENDING", "IN_PROGRESS", "BLOCKED"]);
const PENDING_DOC_STATUSES = new Set(["DRAFT", "IN_REVIEW", "PENDING_APPROVAL"]);
const OPERATIONAL_STATUSES = new Set<PartnershipStatus>(["MOU", "ACTIVE"]);

type PartnershipRow = {
  id: string;
  name: string;
  status: string;
  partnership_type: string;
  end_date: string | null;
};

type MilestoneRow = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  partnership_id: string;
  partnership?: { id: string; name: string } | { id: string; name: string }[] | null;
};

type TaskRow = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  partnership_id: string | null;
};

type DocumentRow = {
  id: string;
  status: string;
  partnership_id: string | null;
};

function partnershipName(row: MilestoneRow): string {
  const p = row.partnership;
  if (!p) return "Partnership";
  return Array.isArray(p) ? p[0]?.name ?? "Partnership" : p.name;
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate) return false;
  if (status === "COMPLETED" || status === "CANCELLED") return false;
  return dueDate < new Date().toISOString().slice(0, 10);
}

function daysUntil(date: string): number {
  const today = new Date(new Date().toISOString().slice(0, 10));
  const target = new Date(date);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function aggregatePartnershipOperations(input: {
  partnerships: PartnershipRow[];
  milestones: MilestoneRow[];
  tasks: TaskRow[];
  documents: DocumentRow[];
}) {
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const p of input.partnerships) {
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    byType[p.partnership_type] = (byType[p.partnership_type] ?? 0) + 1;
  }

  const openMilestones = input.milestones.filter((m) => OPEN_MILESTONE_STATUSES.has(m.status));
  const blockedMilestones = input.milestones.filter((m) => m.status === "BLOCKED");
  const overdueMilestones = input.milestones.filter((m) => isOverdue(m.due_date, m.status));

  const openTasks = input.tasks.filter(
    (t) => t.partnership_id && OPEN_TASK_STATUSES.has(t.status)
  );
  const overdueTasks = openTasks.filter((t) => isOverdue(t.due_date, t.status));

  const linkedDocuments = input.documents.filter((d) => d.partnership_id);
  const documentsPendingReview = linkedDocuments.filter((d) =>
    PENDING_DOC_STATUSES.has(d.status)
  );

  const expiringWithin90Days = input.partnerships.filter(
    (p) =>
      OPERATIONAL_STATUSES.has(p.status as PartnershipStatus) &&
      p.end_date &&
      daysUntil(p.end_date) >= 0 &&
      daysUntil(p.end_date) <= 90
  ).length;

  const attentionByPartnership = new Map<
    string,
    {
      partnershipId: string;
      partnershipName: string;
      status: string;
      blockedMilestones: number;
      overdueMilestones: number;
      overdueTasks: number;
      openTasks: number;
    }
  >();

  function ensureAttention(id: string, name: string, status: string) {
    if (!attentionByPartnership.has(id)) {
      attentionByPartnership.set(id, {
        partnershipId: id,
        partnershipName: name,
        status,
        blockedMilestones: 0,
        overdueMilestones: 0,
        overdueTasks: 0,
        openTasks: 0,
      });
    }
    return attentionByPartnership.get(id)!;
  }

  for (const m of blockedMilestones) {
    const row = ensureAttention(m.partnership_id, partnershipName(m), "ACTIVE");
    row.blockedMilestones += 1;
  }
  for (const m of overdueMilestones) {
    const row = ensureAttention(m.partnership_id, partnershipName(m), "ACTIVE");
    row.overdueMilestones += 1;
  }
  for (const t of openTasks) {
    if (!t.partnership_id) continue;
    const p = input.partnerships.find((x) => x.id === t.partnership_id);
    const row = ensureAttention(t.partnership_id, p?.name ?? "Partnership", p?.status ?? "ACTIVE");
    row.openTasks += 1;
    if (isOverdue(t.due_date, t.status)) row.overdueTasks += 1;
  }

  const attentionItems = [...attentionByPartnership.values()]
    .filter(
      (a) =>
        a.blockedMilestones > 0 || a.overdueMilestones > 0 || a.overdueTasks > 0
    )
    .sort((a, b) => {
      const score = (x: typeof a) =>
        x.blockedMilestones * 3 + x.overdueMilestones * 2 + x.overdueTasks;
      return score(b) - score(a);
    })
    .slice(0, 5);

  const topBlockedMilestones = blockedMilestones.slice(0, 5).map((m) => ({
    id: m.id,
    title: m.title,
    partnershipId: m.partnership_id,
    partnershipName: partnershipName(m),
    due_date: m.due_date,
  }));

  const activeOperational = input.partnerships.filter(
    (p) => p.status === "ACTIVE" || p.status === "MOU"
  ).length;

  return {
    activeCount: input.partnerships.filter((p) => p.status === "ACTIVE").length,
    totalCount: input.partnerships.length,
    activeOperational,
    byStatus,
    byType,
    openMilestones: openMilestones.length,
    blockedMilestones: blockedMilestones.length,
    overdueMilestones: overdueMilestones.length,
    openTasks: openTasks.length,
    overdueTasks: overdueTasks.length,
    linkedDocuments: linkedDocuments.length,
    documentsPendingReview: documentsPendingReview.length,
    expiringWithin90Days,
    attentionItems,
    topBlockedMilestones,
    statusOrder: PARTNERSHIP_STATUSES.map((s) => s.value),
  };
}

export type PartnershipOperationsSummary = ReturnType<typeof aggregatePartnershipOperations>;
