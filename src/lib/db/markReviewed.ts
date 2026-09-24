import { prisma } from "./prisma";

/**
 * Marks a RAG/auto Analysis record as reviewed the first time a human opens
 * it, purely a human-review-state timestamp. Idempotent - never overwrites
 * an existing reviewedAt. Only writes reviewedAt: never touches
 * commentPosted, never calls TWG/RAG/generation - this function has no
 * import path to any of those, so it's structurally incapable of doing more
 * than this one field update.
 */
export async function markReviewedIfNeeded(record: {
  id: string;
  pipelineType: string;
  triggerSource: string;
  reviewedAt: Date | null;
}): Promise<Date | null> {
  if (record.pipelineType !== "rag" || record.triggerSource !== "auto") {
    return record.reviewedAt;
  }
  if (record.reviewedAt) {
    return record.reviewedAt;
  }

  const updated = await prisma.analysis.update({
    where: { id: record.id },
    data: { reviewedAt: new Date() },
    select: { reviewedAt: true },
  });

  return updated.reviewedAt;
}
