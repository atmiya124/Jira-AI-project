import { getJiraProvider } from "@/lib/jira/provider";
import { adfToPlainText } from "@/lib/jira/adf";
import { enhanceRequest } from "@/lib/enrichment/requestEnhancer";
import { retrieveContext } from "@/lib/retrieval/retrieveContext";
import { generateGroundedResponse } from "@/lib/generation/generateResponse";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { Prisma } from "@/generated/prisma";
import { GroundedResponseSchema, type GroundedResponse } from "@/lib/generation/schema";

function isAutoDedupeConflict(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    (err.meta?.target as string[] | undefined)?.includes("autoDedupeKey") === true
  );
}

export type PipelineTriggerSource = "manual" | "auto";

export type PipelineResult = {
  record: Awaited<ReturnType<typeof prisma.analysis.create>>;
  groundedResponse: GroundedResponse;
};

/**
 * The full JiraProvider.fetchIssue -> enhanceRequest -> retrieveContext ->
 * generateGroundedResponse -> persistence sequence, shared by both the manual
 * /api/analyze route and the automatic ticket watcher
 * (scripts/watch-new-tickets.ts), so both paths are guaranteed to behave
 * identically rather than maintaining two copies of the same logic. Which
 * concrete provider (TWG locally, OAuth in production) is used is decided by
 * getJiraProvider() via JIRA_PROVIDER - this function doesn't know or care.
 *
 * Never posts to Jira - this only reads and saves a draft. Posting is a
 * separate, always-explicit action via JiraProvider.postComment, triggered
 * only by the "Post comment to Jira" button.
 *
 * Throws on failure (JiraApiError for fetch failures, plain Error for
 * pipeline failures) - callers decide how to shape that into an HTTP
 * response or a log line, this function only orchestrates.
 */
export async function runGroundedResponsePipeline(params: {
  ticketKey: string;
  triggerSource: PipelineTriggerSource;
}): Promise<PipelineResult> {
  const provider = getJiraProvider();
  const issue = await provider.fetchIssue(params.ticketKey);
  const ticketUrl = await provider.getIssueUrl(issue.key);
  const description = adfToPlainText(issue.fields.description);

  const enriched = await enhanceRequest({ issue, ticketUrl });
  const retrieval = await retrieveContext(enriched);
  const groundedResponse = await generateGroundedResponse(enriched, retrieval);

  let record;
  try {
    record = await prisma.analysis.create({
      data: {
        ticketKey: issue.key,
        ticketUrl,
        ticketSummary: issue.fields.summary,
        ticketDescription: description,
        ticketStatus: issue.fields.status?.name,
        ticketType: issue.fields.issuetype?.name,
        model: env.ANTHROPIC_MODEL,
        pipelineType: "rag",
        triggerSource: params.triggerSource,
        enrichedRequestJson: JSON.stringify(enriched),
        retrievalContextJson: JSON.stringify(retrieval),
        groundedResponseJson: JSON.stringify(groundedResponse),
        draftComment: groundedResponse.suggestedResponse,
        confidence: groundedResponse.confidence,
        // Race-safe idempotency: at most one auto-RAG analysis per ticket,
        // enforced by a DB-level unique constraint (see schema.prisma).
        // Manual/legacy rows leave this null and are unaffected.
        autoDedupeKey: params.triggerSource === "auto" ? issue.key : null,
      },
    });
  } catch (err) {
    // Another concurrent call (e.g. two near-simultaneous webhook
    // deliveries) already won the race and inserted the auto-RAG analysis
    // for this ticket between our caller's pre-check and this insert.
    // Return the winning record instead of throwing - this call's own
    // generated draft is simply discarded.
    if (isAutoDedupeConflict(err)) {
      const existing = await prisma.analysis.findUnique({
        where: { autoDedupeKey: issue.key },
      });
      if (existing) {
        return { record: existing, groundedResponse: GroundedResponseSchema.parse(JSON.parse(existing.groundedResponseJson!)) };
      }
    }
    throw err;
  }

  return { record, groundedResponse };
}
