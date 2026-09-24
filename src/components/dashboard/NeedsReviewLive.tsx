"use client";

import { useState } from "react";
import { usePolling } from "@/lib/dashboard/usePolling";
import { NeedsReviewList } from "./NeedsReviewList";
import type { NeedsReviewRow } from "@/lib/dashboard/queries";

const POLL_INTERVAL_MS = 15_000;

type NeedsReviewApiRow = Omit<NeedsReviewRow, "createdAt"> & { createdAt: string };
type NeedsReviewApiResponse = {
  needsReview: NeedsReviewApiRow[];
  reviewedPending: NeedsReviewApiRow[];
};

function toRows(items: NeedsReviewApiRow[]): NeedsReviewRow[] {
  return items.map((item) => ({ ...item, createdAt: new Date(item.createdAt) }));
}

export function NeedsReviewLive({
  initialNeedsReview,
  initialReviewedPending,
}: {
  initialNeedsReview: NeedsReviewRow[];
  initialReviewedPending: NeedsReviewRow[];
}) {
  const [needsReview, setNeedsReview] = useState(initialNeedsReview);
  const [reviewedPending, setReviewedPending] = useState(initialReviewedPending);

  usePolling(async () => {
    try {
      const res = await fetch("/api/needs-review", { cache: "no-store" });
      if (!res.ok) return;
      const json: NeedsReviewApiResponse = await res.json();
      setNeedsReview(toRows(json.needsReview));
      setReviewedPending(toRows(json.reviewedPending));
    } catch {
      // Skip this tick on a transient network error - the next poll retries.
      // Existing content stays on screen either way.
    }
  }, POLL_INTERVAL_MS);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Needs Review ({needsReview.length})</h1>
        <NeedsReviewList
          items={needsReview}
          state="new"
          emptyTitle="Nothing needs review right now."
          emptySubtitle="Tickets processed automatically by the watcher will appear here."
        />
      </section>

      {reviewedPending.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Reviewed / Pending ({reviewedPending.length})
          </h2>
          <NeedsReviewList items={reviewedPending} state="reviewed" />
        </section>
      )}
    </>
  );
}
