import { prisma } from "@/lib/db/prisma";

/**
 * The single source of truth for dashboard/Needs Review data, used by both
 * the initial server-rendered page load AND the polling API routes
 * (/api/dashboard, /api/needs-review) that keep them fresh client-side -
 * so the query logic exists in exactly one place.
 */

const NEEDS_REVIEW_SELECT = {
  id: true,
  ticketKey: true,
  ticketSummary: true,
  confidence: true,
  createdAt: true,
} as const;

export type NeedsReviewRow = {
  id: string;
  ticketKey: string;
  ticketSummary: string;
  confidence: string | null;
  createdAt: Date;
};

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export type SummaryCounts = {
  needsReview: number;
  processedToday: number;
  postedToday: number;
};

export async function getSummaryCounts(): Promise<SummaryCounts> {
  const today = startOfToday();

  const [needsReview, processedToday, postedToday] = await Promise.all([
    prisma.analysis.count({
      where: {
        pipelineType: "rag",
        triggerSource: "auto",
        reviewedAt: null,
        commentPosted: false,
      },
    }),
    prisma.analysis.count({
      where: { pipelineType: "rag", triggerSource: "auto", createdAt: { gte: today } },
    }),
    prisma.analysis.count({
      where: { commentPosted: true, commentPostedAt: { gte: today } },
    }),
  ]);

  return { needsReview, processedToday, postedToday };
}

export async function getNeedsReviewPreview(limit: number): Promise<NeedsReviewRow[]> {
  return prisma.analysis.findMany({
    where: { pipelineType: "rag", triggerSource: "auto", reviewedAt: null, commentPosted: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: NEEDS_REVIEW_SELECT,
  });
}

export async function getNeedsReviewSections(): Promise<{
  needsReview: NeedsReviewRow[];
  reviewedPending: NeedsReviewRow[];
}> {
  const [needsReview, reviewedPending] = await Promise.all([
    prisma.analysis.findMany({
      where: { pipelineType: "rag", triggerSource: "auto", reviewedAt: null, commentPosted: false },
      orderBy: { createdAt: "desc" },
      select: NEEDS_REVIEW_SELECT,
    }),
    prisma.analysis.findMany({
      where: {
        pipelineType: "rag",
        triggerSource: "auto",
        reviewedAt: { not: null },
        commentPosted: false,
      },
      orderBy: { reviewedAt: "desc" },
      select: NEEDS_REVIEW_SELECT,
    }),
  ]);

  return { needsReview, reviewedPending };
}

export type ActivityItem = {
  id: string;
  ticketKey: string;
  label: string;
};

// Reflects each record's CURRENT state, not a true historical event stream -
// a ticket that was drafted then posted shows one line ("posted to Jira"),
// not two separate entries. No new activity-log table.
function activityLabel(record: {
  commentPosted: boolean;
  pipelineType: string;
  triggerSource: string;
  reviewedAt: Date | null;
}): string {
  if (record.commentPosted) return "posted to Jira";
  if (record.pipelineType === "rag" && record.triggerSource === "auto") {
    return record.reviewedAt ? "reviewed, pending post" : "draft ready for review";
  }
  return "analyzed";
}

export async function getRecentActivity(limit: number): Promise<ActivityItem[]> {
  const items = await prisma.analysis.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      ticketKey: true,
      commentPosted: true,
      pipelineType: true,
      triggerSource: true,
      reviewedAt: true,
    },
  });

  return items.map((item) => ({ id: item.id, ticketKey: item.ticketKey, label: activityLabel(item) }));
}
