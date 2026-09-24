import Link from "next/link";
import { Suspense } from "react";
import { NeedsReviewNavLink } from "@/components/NeedsReviewNavLink";
import { DashboardLive } from "@/components/dashboard/DashboardLive";
import { getSummaryCounts, getNeedsReviewPreview, getRecentActivity } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

const DASHBOARD_PREVIEW_LIMIT = 5;
const RECENT_ACTIVITY_LIMIT = 6;

export default async function Home() {
  const [summary, needsReviewPreview, recentActivity] = await Promise.all([
    getSummaryCounts(),
    getNeedsReviewPreview(DASHBOARD_PREVIEW_LIMIT),
    getRecentActivity(RECENT_ACTIVITY_LIMIT),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">AI Jira Ticket Assistant</h1>
          <p className="text-sm text-zinc-500">Automated Jira triage and response assistant</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/analyze"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Analyze ticket manually
          </Link>
          <Suspense fallback={null}>
            <NeedsReviewNavLink />
          </Suspense>
          <Link href="/history" className="text-sm text-zinc-500 hover:underline">
            History
          </Link>
          {/* <Link href="/getting-started" className="text-xs text-zinc-400 hover:underline">
            Getting Started
          </Link> */}
        </div>
      </header>

      <DashboardLive
        initialSummary={summary}
        initialNeedsReviewPreview={needsReviewPreview}
        initialRecentActivity={recentActivity}
      />
    </div>
  );
}
