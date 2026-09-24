import { prisma } from "@/lib/db/prisma";
import { embedTexts } from "./embed";

export type SearchResult = {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  source: string;
  section: string | null;
  sourceUrl: string | null;
  text: string;
  score: number;
};

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function fetchAllChunks() {
  return prisma.knowledgeChunk.findMany({ include: { document: true } });
}

type ChunkRow = Awaited<ReturnType<typeof fetchAllChunks>>[number];

function scoreChunks(queryEmbedding: number[], chunks: ChunkRow[]): SearchResult[] {
  return chunks
    .map((chunk) => ({
      chunkId: chunk.id,
      documentId: chunk.documentId,
      documentTitle: chunk.document.title,
      source: chunk.document.source,
      section: chunk.section,
      sourceUrl: chunk.document.sourceUrl,
      text: chunk.text,
      score: cosineSimilarity(queryEmbedding, JSON.parse(chunk.embedding) as number[]),
    }))
    .sort((a, b) => b.score - a.score);
}

export async function semanticSearch(query: string, topK = 5): Promise<SearchResult[]> {
  const [queryEmbedding] = await embedTexts([query]);
  const chunks = await fetchAllChunks();
  return scoreChunks(queryEmbedding, chunks).slice(0, topK);
}

/**
 * Runs multiple queries in one batched Voyage embed call and one DB fetch,
 * rather than calling semanticSearch() once per query - both more efficient
 * and friendlier to Voyage's free-tier rate limit when a caller (like the
 * retrieval layer) needs results for several retrievalQueries at once.
 */
export async function semanticSearchMulti(
  queries: string[],
  perQueryTopK = 5,
): Promise<Map<string, SearchResult[]>> {
  if (queries.length === 0) return new Map();

  const [embeddings, chunks] = await Promise.all([embedTexts(queries), fetchAllChunks()]);

  const resultMap = new Map<string, SearchResult[]>();
  queries.forEach((query, i) => {
    resultMap.set(query, scoreChunks(embeddings[i], chunks).slice(0, perQueryTopK));
  });
  return resultMap;
}
