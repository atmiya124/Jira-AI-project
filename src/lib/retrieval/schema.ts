import { z } from "zod";

export const RetrievedChunkSchema = z.object({
  chunkId: z.string(),
  documentId: z.string(),
  documentTitle: z.string(),
  section: z.string().nullable(),
  source: z.string(),
  sourceUrl: z.string().nullable(),
  score: z.number(),
  text: z.string(),
  matchedQueries: z.array(z.string()).describe(
    "Which of the input retrievalQueries this chunk matched - a chunk can match more than " +
      "one query, in which case it appears once with its highest score.",
  ),
});

export const RetrievalContextSchema = z.object({
  ticketKey: z.string(),
  retrievalQueries: z.array(z.string()),
  chunks: z.array(RetrievedChunkSchema),
});

export type RetrievedChunk = z.infer<typeof RetrievedChunkSchema>;
export type RetrievalContext = z.infer<typeof RetrievalContextSchema>;
