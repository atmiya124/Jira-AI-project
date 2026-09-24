import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { buildVersionInfoMap } from "@/lib/db/analysisVersions";
import { HistoryListItem } from "./HistoryListItem";
import { ClearHistoryButton } from "./ClearHistoryButton";

const SIDEBAR_LIMIT = 4;

export async function HistorySidebar() {
  const [items, totalCount, versionInfoMap] = await Promise.all([
    prisma.analysis.findMany({
      orderBy: { createdAt: "desc" },
      take: SIDEBAR_LIMIT,
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
    prisma.analysis.count(),
    buildVersionInfoMap(),
  ]);

  return (
    <aside className="flex w-full flex-col gap-3 lg:w-80">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          History
        </h2>
        {items.length > 0 && <ClearHistoryButton />}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No analyses yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <HistoryListItem
              key={item.id}
              {...item}
              versionInfo={versionInfoMap.get(item.id)}
              dense
            />
          ))}
        </div>
      )}
      {totalCount > SIDEBAR_LIMIT && (
        <Link
          href="/history"
          className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 hover:underline"
        >
          View all ({totalCount}) →
        </Link>
      )}
    </aside>
  );
}
