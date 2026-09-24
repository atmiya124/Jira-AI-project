"use client";

import { useState } from "react";
import Link from "next/link";
import { usePolling } from "@/lib/dashboard/usePolling";
import { SummaryCards } from "./SummaryCards";
import { RecentActivityList } from "./RecentActivityList";
import { NeedsReviewList } from "./NeedsReviewList";
import type { SummaryCounts, NeedsReviewRow, ActivityItem } from "@/lib/dashboard/queries";

const POLL_INTERVAL_MS = 15_000;

type DashboardApiResponse = {
  summary: SummaryCounts;
  needsReviewPreview: (Omit<NeedsReviewRow, "createdAt"> & { createdAt: string })[];
  recentActivity: ActivityItem[];
};

export function DashboardLive({
  initialSummary,
  initialNeedsReviewPreview,
  initialRecentActivity,
}: {
  initialSummary: SummaryCounts;
  initialNeedsReviewPreview: NeedsReviewRow[];
  initialRecentActivity: ActivityItem[];
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [needsReviewPreview, setNeedsReviewPreview] = useState(initialNeedsReviewPreview);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);

  usePolling(async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) return;
      const json: DashboardApiResponse = await res.json();
      setSummary(json.summary);
      setNeedsReviewPreview(
        json.needsReviewPreview.map((item) => ({ ...item, createdAt: new Date(item.createdAt) })),
      );
      setRecentActivity(json.recentActivity);
    } catch {
      // Skip this tick on a transient network error - the next poll retries.
      // Existing content stays on screen either way.
    }
  }, POLL_INTERVAL_MS);

  return (
    <>
      <SummaryCards {...summary} />

      <div className="flex flex-1 flex-col gap-8 lg:flex-row">
        <section className="flex flex-1 flex-col gap-3">
          <h2 className="text-lg font-semibold text-amber-800">Needs Review</h2>
          <NeedsReviewList
            items={needsReviewPreview}
            state="new"
            emptyTitle="Nothing needs review right now."
            emptySubtitle="Tickets processed automatically will appear here."
          />
          <Link
            href="/needs-review"
            className="self-start text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 hover:underline"
          >
            View all →
          </Link>
        </section>

        <aside className="flex w-full flex-col gap-3 lg:w-80">
          <RecentActivityList items={recentActivity} />
        </aside>
      </div>
    </>
  );
}
