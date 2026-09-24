import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "@/lib/claude/client";
import { env } from "@/lib/env";
import { adfToPlainText } from "@/lib/jira/adf";
import type { JiraIssue } from "@/types/jira";
import { LlmEnrichmentSchema, EnrichedRequestSchema } from "./schema";
import type { EnrichedRequest, Attachment } from "./schema";

export type EnhancerInput = {
  issue: JiraIssue;
  ticketUrl: string;
  priority?: string | null;
  attachments?: Attachment[];
};

const SYSTEM_PROMPT = `You are a request-enrichment assistant. Given a Jira ticket, extract structured metadata that will later be used to retrieve relevant documents from a knowledge base (RAG retrieval) — you are NOT solving the ticket or writing an implementation plan.

Produce:
- category: a short topic/category label
- intent: the underlying request type, chosen from the fixed set you're given
- keywords: important terms for search/filtering
- entities: named things mentioned (components, products, systems, error codes, people) with a type label
- missingInformation: gaps that would make the ticket clearer or easier to resolve; empty array if none
- retrievalQueries: 2-5 natural-language search queries a document-retrieval system could run to find relevant material (documentation, runbooks, similar past tickets). Phrase these as search queries, not as restatements of the ticket.

If the description is missing or very sparse, note that in missingInformation and base retrievalQueries on the summary alone rather than inventing details.`;

function buildUserPrompt(input: {
  ticketKey: string;
  summary: string;
  description: string;
  issueType: string | null;
  priority: string | null;
}): string {
  return `Ticket key: ${input.ticketKey}
Issue type: ${input.issueType ?? "Unknown"}
Priority: ${input.priority ?? "Unknown"}
Summary: ${input.summary}

Description:
${input.description || "(No description provided.)"}`;
}

export async function enhanceRequest(input: EnhancerInput): Promise<EnrichedRequest> {
  const description = adfToPlainText(input.issue.fields.description);
  const issueType = input.issue.fields.issuetype?.name ?? null;
  const priority = input.priority ?? null;

  const response = await anthropic.messages.parse({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt({
          ticketKey: input.issue.key,
          summary: input.issue.fields.summary,
          description,
          issueType,
          priority,
        }),
      },
    ],
    output_config: { format: zodOutputFormat(LlmEnrichmentSchema) },
  });

  if (!response.parsed_output) {
    throw new Error("Claude did not return a parseable request enrichment");
  }

  return EnrichedRequestSchema.parse({
    ...response.parsed_output,
    ticketKey: input.issue.key,
    summary: input.issue.fields.summary,
    description,
    issueType,
    priority,
    attachments: input.attachments ?? [],
    ticketUrl: input.ticketUrl,
  });
}
