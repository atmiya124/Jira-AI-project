import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { NeedsReviewItem } from "@/components/NeedsReviewItem";

export const dynamic = "force-dynamic";

const SELECT_FIELDS = {
  id: true,
  ticketKey: true,
  ticketSummary: true,
  confidence: true,
  createdAt: true,
} as const;

export default async function NeedsReviewPage() {
  const [needsReview, reviewedPending] = await Promise.all([
    prisma.analysis.findMany({
      where: { pipelineType: "rag", triggerSource: "auto", reviewedAt: null, commentPosted: false },
      orderBy: { createdAt: "desc" },
      select: SELECT_FIELDS,
    }),
    prisma.analysis.findMany({
      where: {
        pipelineType: "rag",
        triggerSource: "auto",
        reviewedAt: { not: null },
        commentPosted: false,
      },
      orderBy: { reviewedAt: "desc" },
      select: SELECT_FIELDS,
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back
      </Link>

      <section className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Needs Review ({needsReview.length})</h1>
        {needsReview.length === 0 ? (
          <div className="rounded-md border border-zinc-200 p-6 text-center">
            <p className="text-sm text-zinc-600">Nothing needs review right now.</p>
            <p className="mt-1 text-xs text-zinc-400">
              Tickets processed automatically by the watcher will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {needsReview.map((item) => (
              <NeedsReviewItem key={item.id} {...item} state="new" />
            ))}
          </div>
        )}
      </section>

      {reviewedPending.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Reviewed / Pending ({reviewedPending.length})
          </h2>
          <div className="flex flex-col gap-2">
            {reviewedPending.map((item) => (
              <NeedsReviewItem key={item.id} {...item} state="reviewed" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
