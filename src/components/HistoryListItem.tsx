import Link from "next/link";
import { ComplexityBadge } from "./ComplexityBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { TicketVersionLabel } from "./TicketVersionLabel";
import type { VersionInfo } from "@/lib/db/analysisVersions";

export function HistoryListItem({
  id,
  ticketKey,
  ticketSummary,
  estimatedComplexity,
  confidence,
  pipelineType,
  triggerSource,
  createdAt,
  commentPosted,
  versionInfo,
  dense = false,
}: {
  id: string;
  ticketKey: string;
  ticketSummary: string;
  estimatedComplexity: string | null;
  confidence: string | null;
  pipelineType: string;
  triggerSource: string;
  createdAt: Date;
  commentPosted: boolean;
  versionInfo?: VersionInfo;
  dense?: boolean;
}) {
  return (
    <Link
      href={`/history/${id}`}
      className={`flex flex-col gap-1 rounded-md border border-zinc-200 transition-colors hover:border-zinc-400 ${
        dense ? "p-2 text-xs" : "p-3 text-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-medium">
          <TicketVersionLabel ticketKey={ticketKey} versionInfo={versionInfo} />
          {triggerSource === "auto" && (
            <span
              className={`rounded-full bg-blue-100 px-1.5 py-0.5 font-medium text-blue-700 ${dense ? "text-[9px]" : "text-[10px]"}`}
              title="Automatically detected and analyzed"
            >
              Auto
            </span>
          )}
        </span>
        {commentPosted && (
          <span className={`text-green-700 ${dense ? "text-[10px]" : "text-xs"}`}>Posted</span>
        )}
      </div>
      <p className={`line-clamp-2 text-zinc-600 ${dense ? "text-[11px]" : ""}`}>{ticketSummary}</p>
      <div className="flex items-center justify-between gap-2">
        {pipelineType === "rag" && confidence ? (
          <ConfidenceBadge confidence={confidence} size={dense ? "sm" : "md"} />
        ) : (
          <ComplexityBadge complexity={estimatedComplexity ?? "Unknown"} size={dense ? "sm" : "md"} />
        )}
        <span className={`text-zinc-400 ${dense ? "text-[10px]" : "text-xs"}`}>
          {createdAt.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
