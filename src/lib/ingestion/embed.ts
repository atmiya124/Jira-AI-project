import { VoyageAIClient } from "voyageai";
import { ingestionEnv } from "./env";

const client = new VoyageAIClient({ apiKey: ingestionEnv.VOYAGE_API_KEY });

const MAX_BATCH_SIZE = 100;

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE);
    const response = await client.embed({ input: batch, model: ingestionEnv.VOYAGE_MODEL });
    const data = response.data ?? [];

    if (data.length !== batch.length) {
      throw new Error(`Voyage embed returned ${data.length} embeddings for ${batch.length} inputs`);
    }

    // Sort by the item's own `index` rather than assuming array order matches
    // input order.
    const sorted = [...data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    for (const item of sorted) {
      if (!item.embedding) throw new Error("Voyage embed response item missing embedding vector");
      results.push(item.embedding);
    }
  }

  return results;
}
