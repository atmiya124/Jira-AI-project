import Link from "next/link";
import { ConfidenceBadge } from "./ConfidenceBadge";

export function NeedsReviewItem({
  id,
  ticketKey,
  ticketSummary,
  confidence,
  createdAt,
  state = "new",
}: {
  id: string;
  ticketKey: string;
  ticketSummary: string;
  confidence: string | null;
  createdAt: Date;
  state?: "new" | "reviewed";
}) {
  const pillLabel = state === "new" ? "New" : "Reviewed";
  const pillClasses =
    state === "new" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-600";

  return (
    <Link
      href={`/history/${id}`}
      className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 text-sm transition-colors hover:border-zinc-400"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{ticketKey}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${pillClasses}`}>
          {pillLabel}
        </span>
      </div>
      <p className="line-clamp-2 text-zinc-600">{ticketSummary}</p>
      <div className="flex items-center justify-between gap-2">
        <ConfidenceBadge confidence={confidence ?? "low"} size="sm" />
        <span className="text-xs text-zinc-400">{createdAt.toLocaleString()}</span>
      </div>
      <div className="flex justify-end">
        <span className="text-xs font-medium text-zinc-700">Review →</span>
      </div>
    </Link>
  );
}
