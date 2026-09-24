import { semanticSearchMulti } from "@/lib/ingestion/search";
import type { EnrichedRequest } from "@/lib/enrichment/schema";
import { RetrievalContextSchema, type RetrievalContext, type RetrievedChunk } from "./schema";

const PER_QUERY_TOP_K = 5;
const FINAL_TOP_K = 8;

/**
 * Connects the Request Enhancer's retrievalQueries to the semantic-search
 * layer: runs every query, merges results across queries, deduplicates
 * chunks that matched more than one query (keeping the highest score and
 * recording every matching query), ranks by score, and returns a validated
 * RetrievalContext. Pure orchestration - no LLM call here, and no coupling
 * to any future response-generation layer.
 */
export async function retrieveContext(enriched: EnrichedRequest): Promise<RetrievalContext> {
  const queries = enriched.retrievalQueries;
  const resultsByQuery = await semanticSearchMulti(queries, PER_QUERY_TOP_K);

  const chunkMap = new Map<string, RetrievedChunk>();

  for (const [query, results] of resultsByQuery) {
    for (const r of results) {
      const existing = chunkMap.get(r.chunkId);
      if (existing) {
        existing.matchedQueries.push(query);
        if (r.score > existing.score) existing.score = r.score;
      } else {
        chunkMap.set(r.chunkId, {
          chunkId: r.chunkId,
          documentId: r.documentId,
          documentTitle: r.documentTitle,
          section: r.section,
          source: r.source,
          sourceUrl: r.sourceUrl,
          score: r.score,
          text: r.text,
          matchedQueries: [query],
        });
      }
    }
  }

  const ranked = [...chunkMap.values()].sort((a, b) => b.score - a.score).slice(0, FINAL_TOP_K);

  return RetrievalContextSchema.parse({
    ticketKey: enriched.ticketKey,
    retrievalQueries: queries,
    chunks: ranked,
  });
}
