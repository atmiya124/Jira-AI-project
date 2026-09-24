import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { postJiraCommentViaTwg as postJiraComment } from "@/lib/jira/twg/client";
import { JiraApiError } from "@/lib/jira/errors";
import { errorResponse, jiraErrorResponse } from "@/lib/apiError";

const RequestSchema = z.object({
  commentOverride: z.string().trim().min(1).optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await prisma.analysis.findUnique({ where: { id } });

  if (!record) {
    return errorResponse("NOT_FOUND", `No analysis found with id ${id}`, 404);
  }

  const body = await request.json().catch(() => ({}));
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("INVALID_REQUEST", "commentOverride must be a non-empty string if provided", 400);
  }

  const commentText = parsed.data.commentOverride ?? record.draftComment;

  let posted;
  try {
    posted = await postJiraComment(record.ticketKey, commentText);
  } catch (err) {
    if (err instanceof JiraApiError) return jiraErrorResponse(err);
    throw err;
  }

  const updated = await prisma.analysis.update({
    where: { id },
    data: {
      commentPosted: true,
      commentPostedAt: new Date(),
      jiraCommentId: posted.id,
    },
  });

  return NextResponse.json({
    commentPosted: true,
    commentPostedAt: updated.commentPostedAt,
    jiraCommentId: updated.jiraCommentId,
  });
}
