import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { JiraApiError } from "@/lib/jira/errors";
import { runGroundedResponsePipeline } from "@/lib/pipeline/runGroundedResponsePipeline";
import { getVersionInfo } from "@/lib/db/analysisVersions";
import { errorResponse, jiraErrorResponse } from "@/lib/apiError";

const RequestSchema = z.object({
  ticketKey: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("INVALID_REQUEST", "ticketKey is required", 400);
  }

  const ticketKey = parsed.data.ticketKey.toUpperCase();

  let result;
  try {
    result = await runGroundedResponsePipeline({ ticketKey, triggerSource: "manual" });
  } catch (err) {
    if (err instanceof JiraApiError) return jiraErrorResponse(err);
    const message = err instanceof Error ? err.message : "AI response generation failed";
    return errorResponse("AI_ANALYSIS_FAILED", message, 502);
  }

  const { record, groundedResponse } = result;
  const versionInfo = await getVersionInfo(record.ticketKey, record.createdAt);

  return NextResponse.json(
    {
      id: record.id,
      ticketKey: record.ticketKey,
      ticketUrl: record.ticketUrl,
      ticketSummary: record.ticketSummary,
      createdAt: record.createdAt,
      pipelineType: "rag" as const,
      groundedResponse,
      versionInfo,
    },
    { status: 201 },
  );
}
