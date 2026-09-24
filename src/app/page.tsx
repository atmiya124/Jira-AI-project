import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/db/prisma";
import { NeedsReviewNavLink } from "@/components/NeedsReviewNavLink";
import { NeedsReviewItem } from "@/components/NeedsReviewItem";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";

export const dynamic = "force-dynamic";

const DASHBOARD_PREVIEW_LIMIT = 5;

export default async function Home() {
  const needsReviewPreview = await prisma.analysis.findMany({
    where: { pipelineType: "rag", triggerSource: "auto", reviewedAt: null, commentPosted: false },
    orderBy: { createdAt: "desc" },
    take: DASHBOARD_PREVIEW_LIMIT,
    select: {
      id: true,
      ticketKey: true,
      ticketSummary: true,
      confidence: true,
      createdAt: true,
    },
  });

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

      <Suspense fallback={null}>
        <SummaryCards />
      </Suspense>

      <div className="flex flex-1 flex-col gap-8 lg:flex-row">
        <section className="flex flex-1 flex-col gap-3">
          <h2 className="text-lg font-semibold text-amber-800">Needs Review</h2>
          {needsReviewPreview.length === 0 ? (
            <div className="rounded-md border border-zinc-200 p-6 text-center">
              <p className="text-sm text-zinc-600">Nothing needs review right now.</p>
              <p className="mt-1 text-xs text-zinc-400">
                Tickets processed automatically by the watcher will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {needsReviewPreview.map((item) => (
                <NeedsReviewItem key={item.id} {...item} state="new" />
              ))}
            </div>
          )}
          <Link
            href="/needs-review"
            className="self-start text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 hover:underline"
          >
            View all →
          </Link>
        </section>

        <aside className="flex w-full flex-col gap-3 lg:w-80">
          <Suspense fallback={null}>
            <RecentActivityList />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
