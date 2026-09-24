import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/db/prisma";
import { buildVersionInfoMap } from "@/lib/db/analysisVersions";
import { HistoryListItem } from "@/components/HistoryListItem";
import { ClearHistoryButton } from "@/components/ClearHistoryButton";
import { NeedsReviewNavLink } from "@/components/NeedsReviewNavLink";

export const dynamic = "force-dynamic";

export default async function AllHistoryPage() {
  const [items, versionInfoMap] = await Promise.all([
    prisma.analysis.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ticketKey: true,
        ticketSummary: true,
        estimatedComplexity: true,
        confidence: true,
        pipelineType: true,
        triggerSource: true,
        createdAt: true,
        commentPosted: true,
      },
    }),
    buildVersionInfoMap(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between gap-2">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Back
        </Link>
        <Suspense fallback={null}>
          <NeedsReviewNavLink />
        </Suspense>
      </div>

      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">All Analyses ({items.length})</h1>
        {items.length > 0 && <ClearHistoryButton />}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No analyses yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <HistoryListItem key={item.id} {...item} versionInfo={versionInfoMap.get(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
