import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse } from "@/lib/apiError";
import type { Analysis } from "@/lib/claude/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await prisma.analysis.findUnique({ where: { id } });

  if (!record) {
    return errorResponse("NOT_FOUND", `No analysis found with id ${id}`, 404);
  }

  const analysis = JSON.parse(record.analysisJson ?? "{}") as Analysis;

  return NextResponse.json({
    id: record.id,
    ticketKey: record.ticketKey,
    ticketUrl: record.ticketUrl,
    ticketSummary: record.ticketSummary,
    ticketDescription: record.ticketDescription,
    ticketStatus: record.ticketStatus,
    ticketType: record.ticketType,
    model: record.model,
    createdAt: record.createdAt,
    commentPosted: record.commentPosted,
    commentPostedAt: record.commentPostedAt,
    jiraCommentId: record.jiraCommentId,
    analysis,
  });
}
