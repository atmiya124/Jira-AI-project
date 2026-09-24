import { NeedsReviewItem } from "@/components/NeedsReviewItem";
import type { NeedsReviewRow } from "@/lib/dashboard/queries";

export function NeedsReviewList({
  items,
  state,
  emptyTitle,
  emptySubtitle,
}: {
  items: NeedsReviewRow[];
  state: "new" | "reviewed";
  emptyTitle?: string;
  emptySubtitle?: string;
}) {
  if (items.length === 0) {
    if (!emptyTitle) return null;
    return (
      <div className="rounded-md border border-zinc-200 p-6 text-center">
        <p className="text-sm text-zinc-600">{emptyTitle}</p>
        {emptySubtitle && <p className="mt-1 text-xs text-zinc-400">{emptySubtitle}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <NeedsReviewItem key={item.id} {...item} state={state} />
      ))}
    </div>
  );
}
