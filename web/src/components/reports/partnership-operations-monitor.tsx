import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  labelFor,
  PARTNERSHIP_STATUSES,
  PARTNERSHIP_TYPES,
  partnershipStatusVariant,
  milestoneStatusVariant,
} from "@/lib/constants/partnerships";
import type { ExecutiveReportData } from "@/types/reports";
import { Handshake } from "lucide-react";

export function PartnershipOperationsMonitor({
  data,
}: {
  data: ExecutiveReportData["partnerships"];
}) {
  const hasAttention =
    data.blockedMilestones > 0 ||
    data.overdueMilestones > 0 ||
    data.overdueTasks > 0 ||
    data.documentsPendingReview > 0;

  return (
    <Card
      className={`mt-6 ${hasAttention ? "border-brand-purple/30 bg-brand-purple/5" : "border-gray-200"}`}
    >
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-brand-purple" />
              Partnership Operations
            </CardTitle>
            <CardDescription>
              Workspace snapshot — milestones, tasks, and documents across partnerships
            </CardDescription>
          </div>
          <Link
            href="/partnerships"
            className="text-sm font-medium text-brand-purple hover:underline"
          >
            View all partnerships →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Active / MOU</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{data.activeOperational}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Open milestones</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{data.openMilestones}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Blocked / overdue</p>
            <p className={`mt-1 text-2xl font-bold ${data.blockedMilestones + data.overdueMilestones > 0 ? "text-red-600" : "text-gray-900"}`}>
              {data.blockedMilestones + data.overdueMilestones}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Linked documents</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{data.linkedDocuments}</p>
            {data.documentsPendingReview > 0 && (
              <p className="mt-1 text-xs text-brand-gold">
                {data.documentsPendingReview} pending review
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              By lifecycle status
            </p>
            <div className="space-y-2 text-sm">
              {data.statusOrder.map((status) => {
                const count = data.byStatus[status] ?? 0;
                return (
                  <div key={status} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/partnerships?status=${status}`}
                      className={count > 0 ? "text-gray-700 hover:text-brand-purple" : "text-gray-400 hover:text-brand-purple"}
                    >
                      {labelFor(PARTNERSHIP_STATUSES, status)}
                    </Link>
                    <span className={`font-medium ${count > 0 ? "text-gray-900" : "text-gray-400"}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Implementation workload
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Open partnership tasks</span>
                <span className="font-medium">{data.openTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overdue tasks</span>
                <span className={`font-medium ${data.overdueTasks > 0 ? "text-red-600" : ""}`}>
                  {data.overdueTasks}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overdue milestones</span>
                <span className={`font-medium ${data.overdueMilestones > 0 ? "text-red-600" : ""}`}>
                  {data.overdueMilestones}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiring within 90 days</span>
                <span className={`font-medium ${data.expiringWithin90Days > 0 ? "text-brand-gold" : ""}`}>
                  {data.expiringWithin90Days}
                </span>
              </div>
            </div>

            {Object.keys(data.byType).length > 0 && (
              <>
                <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  By partnership type
                </p>
                <div className="space-y-2 text-sm">
                  {Object.entries(data.byType)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <Link
                          href={`/partnerships?partnership_type=${type}`}
                          className="text-gray-600 hover:text-brand-purple"
                        >
                          {labelFor(PARTNERSHIP_TYPES, type)}
                        </Link>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>

        {data.topBlockedMilestones.length > 0 && (
          <div className="mt-5 border-t border-gray-200 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Blocked milestones
            </p>
            <ul className="space-y-2 text-sm">
              {data.topBlockedMilestones.map((m) => (
                <li key={m.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/partnerships/${m.partnershipId}`}
                      className="font-medium text-brand-purple hover:underline"
                    >
                      {m.partnershipName}
                    </Link>
                    <p className="text-gray-600">{m.title}</p>
                  </div>
                  <Badge variant={milestoneStatusVariant("BLOCKED")}>Blocked</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.attentionItems.length > 0 && (
          <div className="mt-5 border-t border-gray-200 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Partnerships needing attention
            </p>
            <ul className="space-y-2 text-sm">
              {data.attentionItems.map((item) => (
                <li key={item.partnershipId} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/partnerships/${item.partnershipId}`}
                      className="font-medium text-brand-purple hover:underline"
                    >
                      {item.partnershipName}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-gray-500">
                      {item.blockedMilestones > 0 && (
                        <span>{item.blockedMilestones} blocked milestone{item.blockedMilestones !== 1 ? "s" : ""}</span>
                      )}
                      {item.overdueMilestones > 0 && (
                        <span>{item.overdueMilestones} overdue milestone{item.overdueMilestones !== 1 ? "s" : ""}</span>
                      )}
                      {item.overdueTasks > 0 && (
                        <span>{item.overdueTasks} overdue task{item.overdueTasks !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={partnershipStatusVariant(item.status as never)}>
                    {labelFor(PARTNERSHIP_STATUSES, item.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
