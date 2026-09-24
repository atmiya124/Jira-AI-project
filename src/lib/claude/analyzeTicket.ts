import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "./client";
import { AnalysisSchema, type Analysis } from "./schema";
import { env } from "@/lib/env";

const SYSTEM_PROMPT = `You are a senior software engineer assisting a development team by analyzing Jira tickets before implementation begins.

Given a ticket's key, summary, description, type, and status, produce a structured analysis to help a developer plan the work: a summary, unclear/ambiguous requirements, acceptance criteria, an ordered subtask breakdown, likely files/components to change, an implementation approach, test cases, a QA checklist, a draft completion comment, and a complexity estimate with rationale.

Important constraint: you do NOT have access to the actual codebase. Any files or components you suggest must be inferred from the wording of the ticket only (e.g. component names, feature areas, or technology mentioned in the text). Phrase these as likely candidates based on the ticket description, not as confirmed facts - never claim certainty about the real codebase structure.

If the ticket description is missing or very sparse, say so explicitly in "ambiguities" rather than inventing requirements.`;

function buildUserPrompt(input: {
  ticketKey: string;
  summary: string;
  description: string;
  issueType?: string;
  status?: string;
}): string {
  return `Analyze the following Jira ticket. Remember: suggest files/components based only on the wording below, not on real codebase knowledge.

Ticket key: ${input.ticketKey}
Issue type: ${input.issueType ?? "Unknown"}
Status: ${input.status ?? "Unknown"}
Summary: ${input.summary}

Description:
${input.description || "(No description provided.)"}`;
}

export async function analyzeTicket(input: {
  ticketKey: string;
  summary: string;
  description: string;
  issueType?: string;
  status?: string;
}): Promise<Analysis> {
  const response = await anthropic.messages.parse({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(input) }],
    output_config: { format: zodOutputFormat(AnalysisSchema) },
  });

  if (!response.parsed_output) {
    throw new Error("Claude did not return a parseable structured analysis");
  }

  return response.parsed_output;
}
