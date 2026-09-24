import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

const RECENT_ACTIVITY_LIMIT = 6;

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

export async function RecentActivityList() {
  const items = await prisma.analysis.findMany({
    orderBy: { createdAt: "desc" },
    take: RECENT_ACTIVITY_LIMIT,
    select: {
      id: true,
      ticketKey: true,
      commentPosted: true,
      pipelineType: true,
      triggerSource: true,
      reviewedAt: true,
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Recent Activity
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No activity yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5 text-sm">
          {items.map((item) => (
            <li key={item.id} className="text-zinc-600">
              <span className="font-medium text-zinc-900">{item.ticketKey}</span> →{" "}
              {activityLabel(item)}
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/history"
        className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 hover:underline"
      >
        View History →
      </Link>
    </div>
  );
}
