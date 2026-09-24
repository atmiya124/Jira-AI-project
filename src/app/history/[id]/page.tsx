import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getVersionInfo } from "@/lib/db/analysisVersions";
import { markReviewedIfNeeded } from "@/lib/db/markReviewed";
import { AnalysisResult } from "@/components/AnalysisResult";
import { GroundedResponseResult } from "@/components/GroundedResponseResult";
import type { Analysis } from "@/lib/claude/schema";
import type { GroundedResponse } from "@/lib/generation/schema";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await prisma.analysis.findUnique({ where: { id } });

  if (!record) {
    notFound();
  }

  // Human-review-state only: marks reviewedAt on first open, idempotent,
  // never touches commentPosted or triggers any RAG/TWG/posting behavior.
  await markReviewedIfNeeded(record);

  const versionInfo = await getVersionInfo(record.ticketKey, record.createdAt);
  const initialCommentPosted = record.commentPosted;
  const initialCommentPostedAt = record.commentPostedAt?.toISOString() ?? null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back
      </Link>
      {record.pipelineType === "rag" && record.groundedResponseJson ? (
        <GroundedResponseResult
          id={record.id}
          ticketKey={record.ticketKey}
          ticketUrl={record.ticketUrl}
          groundedResponse={JSON.parse(record.groundedResponseJson) as GroundedResponse}
          initialCommentPosted={initialCommentPosted}
          initialCommentPostedAt={initialCommentPostedAt}
          versionInfo={versionInfo}
          triggerSource={record.triggerSource}
        />
      ) : (
        <AnalysisResult
          id={record.id}
          ticketKey={record.ticketKey}
          ticketUrl={record.ticketUrl}
          analysis={JSON.parse(record.analysisJson ?? "{}") as Analysis}
          initialCommentPosted={initialCommentPosted}
          initialCommentPostedAt={initialCommentPostedAt}
          versionInfo={versionInfo}
        />
      )}
    </div>
  );
}
