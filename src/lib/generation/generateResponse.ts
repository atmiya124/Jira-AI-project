import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "@/lib/claude/client";
import { env } from "@/lib/env";
import type { EnrichedRequest } from "@/lib/enrichment/schema";
import type { RetrievalContext } from "@/lib/retrieval/schema";
import { LlmGroundedResponseSchema, GroundedResponseSchema, type GroundedResponse } from "./schema";

const SYSTEM_PROMPT = `You are drafting a grounded suggested response to a ticket, using ONLY the retrieved company knowledge provided plus the ticket itself.

Rules:
- Use the retrieved knowledge chunks when they are relevant, and cite them by their refId (e.g. "S1") in usedSourceRefIds.
- Do NOT invent internal policies, procedures, or facts that are not present in the retrieved chunks. If something the ticket needs isn't covered by the retrieved knowledge, say so explicitly in missingInformation instead of guessing or presenting general knowledge as if it were internal documentation.
- Do NOT cite a source unless you actually drew on its content for suggestedResponse. Never invent a refId that wasn't given to you - only use refIds exactly as listed below.
- If none of the retrieved chunks are actually relevant to the ticket, say so: leave usedSourceRefIds empty and note the gap in missingInformation, rather than forcing an irrelevant citation.

suggestedResponse must be short and Jira-ready - a reviewer should be able to read it in a few seconds and paste it in with minimal editing:
- Roughly 3-6 sentences, or a small number of short bullet points. Not a structured report.
- Combine the important fix, recommendation, and testing information into ONE cohesive response.
- Do NOT break it into separate labeled sections such as "Recommended Fix", "Recommended Testing Steps", or "Recommended Actions" - that level of itemized detail belongs in the separate recommendedActions field, not inside suggestedResponse.

recommendedActions is a separate, more detailed field for internal/history reference (not shown to the reviewer as the primary response) - still produce it as its own list of concrete action items, independent of how concise suggestedResponse is.

confidence must reflect how well the retrieved knowledge actually supports suggestedResponse:
  "high" = retrieved knowledge directly and specifically addresses the ticket.
  "medium" = retrieved knowledge is partially relevant or requires some inference.
  "low" = retrieved knowledge is weak, tangential, or largely absent, and the response relies mostly on general reasoning rather than grounded facts.`;

function buildUserPrompt(enriched: EnrichedRequest, context: RetrievalContext): string {
  const sourcesBlock = context.chunks
    .map((c, i) => {
      const refId = `S${i + 1}`;
      return `[${refId}] ${c.documentTitle}${c.section ? ` > ${c.section}` : ""} (relevance score: ${c.score.toFixed(3)})\n${c.text}`;
    })
    .join("\n\n");

  return `Ticket key: ${enriched.ticketKey}
Summary: ${enriched.summary}
Issue type: ${enriched.issueType ?? "Unknown"}
Priority: ${enriched.priority ?? "Unknown"}
Category: ${enriched.category}
Intent: ${enriched.intent}

Description:
${enriched.description || "(No description provided.)"}

Retrieved knowledge (cite by refId only, exactly as labeled - e.g. "S1"):
${sourcesBlock || "(No relevant knowledge was retrieved.)"}`;
}

export async function generateGroundedResponse(
  enriched: EnrichedRequest,
  context: RetrievalContext,
): Promise<GroundedResponse> {
  const refMap = new Map(context.chunks.map((chunk, i) => [`S${i + 1}`, chunk]));

  const response = await anthropic.messages.parse({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(enriched, context) }],
    output_config: { format: zodOutputFormat(LlmGroundedResponseSchema) },
  });

  if (!response.parsed_output) {
    throw new Error("Claude did not return a parseable grounded response");
  }

  const llm = response.parsed_output;

  // Map Claude's cited refIds back to REAL chunk metadata from RetrievalContext.
  // A refId Claude didn't actually receive (hallucinated) has no entry in
  // refMap and is silently dropped here, never trusted into the output.
  const sourcesUsed = llm.usedSourceRefIds
    .map((refId) => refMap.get(refId))
    .filter((chunk): chunk is NonNullable<typeof chunk> => chunk !== undefined)
    .map((chunk) => ({
      chunkId: chunk.chunkId,
      documentTitle: chunk.documentTitle,
      section: chunk.section,
      source: chunk.source,
      sourceUrl: chunk.sourceUrl,
      score: chunk.score,
    }));

  return GroundedResponseSchema.parse({
    summary: llm.summary,
    suggestedResponse: llm.suggestedResponse,
    recommendedActions: llm.recommendedActions,
    missingInformation: llm.missingInformation,
    sourcesUsed,
    confidence: llm.confidence,
  });
}
