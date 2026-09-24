import { z } from "zod";

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);

/**
 * What Claude actually generates. Deliberately does NOT include document
 * title/section/sourceUrl - Claude only cites by refId (e.g. "S1"), and the
 * real citation metadata is joined back from RetrievalContext in code. This
 * makes "sources must map back to actual RetrievalContext entries" a hard
 * invariant rather than a prompt instruction Claude could ignore.
 */
export const LlmGroundedResponseSchema = z.object({
  summary: z.string().describe("Brief summary of the request and what's being suggested"),
  suggestedResponse: z
    .string()
    .describe(
      "A short, Jira-ready response (roughly 3-6 sentences or a few short bullets) that combines " +
        "the key fix/recommendation/testing points into ONE cohesive response - not a structured " +
        "report. Do not break it into separate labeled sections like 'Recommended Fix' or " +
        "'Recommended Testing Steps'; that level of detail belongs in recommendedActions instead.",
    ),
  recommendedActions: z
    .array(z.string())
    .describe(
      "Separate, more detailed action items for internal/history reference - not shown to the " +
        "reviewer as the primary response, so this can be as detailed as useful.",
    ),
  missingInformation: z
    .array(z.string())
    .describe("Gaps: what the retrieved knowledge doesn't cover, or what's needed to be more confident"),
  usedSourceRefIds: z
    .array(z.string())
    .describe(
      "The refId (e.g. 'S1') of every retrieved source actually drawn on for suggestedResponse. " +
        "Only include a refId if its content was meaningfully used. Empty if none were relevant.",
    ),
  confidence: ConfidenceSchema,
});

export type LlmGroundedResponse = z.infer<typeof LlmGroundedResponseSchema>;

export const SourceUsedSchema = z.object({
  chunkId: z.string(),
  documentTitle: z.string(),
  section: z.string().nullable(),
  source: z.string(),
  sourceUrl: z.string().nullable(),
  score: z.number(),
});

export const GroundedResponseSchema = z.object({
  summary: z.string(),
  suggestedResponse: z.string(),
  recommendedActions: z.array(z.string()),
  missingInformation: z.array(z.string()),
  sourcesUsed: z.array(SourceUsedSchema),
  confidence: ConfidenceSchema,
});

export type GroundedResponse = z.infer<typeof GroundedResponseSchema>;
