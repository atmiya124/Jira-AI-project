import { fetchJiraIssueViaTwg, jiraIssueUrlViaTwg } from "@/lib/jira/twg/client";
import { adfToPlainText } from "@/lib/jira/adf";
import { enhanceRequest } from "@/lib/enrichment/requestEnhancer";
import { retrieveContext } from "@/lib/retrieval/retrieveContext";
import { generateGroundedResponse } from "@/lib/generation/generateResponse";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import type { GroundedResponse } from "@/lib/generation/schema";

export type PipelineTriggerSource = "manual" | "auto";

export type PipelineResult = {
  record: Awaited<ReturnType<typeof prisma.analysis.create>>;
  groundedResponse: GroundedResponse;
};

/**
 * The full TWG -> enhanceRequest -> retrieveContext -> generateGroundedResponse
 * -> persistence sequence, shared by both the manual /api/analyze route and
 * the automatic ticket watcher (scripts/watch-new-tickets.ts), so both paths
 * are guaranteed to behave identically rather than maintaining two copies of
 * the same logic.
 *
 * Never posts to Jira - this only reads and saves a draft. Posting is a
 * separate, always-explicit action via postJiraCommentViaTwg, triggered only
 * by the "Post comment to Jira" button.
 *
 * Throws on failure (JiraApiError for fetch failures, plain Error for
 * pipeline failures) - callers decide how to shape that into an HTTP
 * response or a log line, this function only orchestrates.
 */
export async function runGroundedResponsePipeline(params: {
  ticketKey: string;
  triggerSource: PipelineTriggerSource;
}): Promise<PipelineResult> {
  const issue = await fetchJiraIssueViaTwg(params.ticketKey);
  const ticketUrl = jiraIssueUrlViaTwg(issue.key);
  const description = adfToPlainText(issue.fields.description);

  const enriched = await enhanceRequest({ issue, ticketUrl });
  const retrieval = await retrieveContext(enriched);
  const groundedResponse = await generateGroundedResponse(enriched, retrieval);

  const record = await prisma.analysis.create({
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
    },
  });

  return { record, groundedResponse };
}
