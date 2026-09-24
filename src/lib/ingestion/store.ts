import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { embedTexts } from "./embed";
import { ingestionEnv } from "./env";
import type { AcquiredDocument, Chunk } from "./types";

function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export type IngestResult =
  | { status: "skipped_unchanged"; documentId: string; chunkCount: number }
  | { status: "ingested"; documentId: string; chunkCount: number };

export async function upsertDocument(
  doc: AcquiredDocument,
  chunks: Chunk[],
  plainText: string,
): Promise<IngestResult> {
  const contentHash = hashText(plainText);

  const existing = await prisma.knowledgeDocument.findUnique({
    where: { source_sourceId: { source: doc.source, sourceId: doc.sourceId } },
  });

  if (existing && existing.contentHash === contentHash) {
    const chunkCount = await prisma.knowledgeChunk.count({ where: { documentId: existing.id } });
    return { status: "skipped_unchanged", documentId: existing.id, chunkCount };
  }

  // Embeddings are only generated once we know the content actually changed.
  const embeddings = await embedTexts(chunks.map((c) => c.text));

  const documentId = await prisma.$transaction(async (tx) => {
    const document = existing
      ? await tx.knowledgeDocument.update({
          where: { id: existing.id },
          data: {
            title: doc.title,
            sourceUrl: doc.sourceUrl,
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : null,
            contentHash,
            ingestedAt: new Date(),
          },
        })
      : await tx.knowledgeDocument.create({
          data: {
            source: doc.source,
            sourceId: doc.sourceId,
            title: doc.title,
            sourceUrl: doc.sourceUrl,
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : null,
            contentHash,
          },
        });

    if (existing) {
      await tx.knowledgeChunk.deleteMany({ where: { documentId: document.id } });
    }

    await tx.knowledgeChunk.createMany({
      data: chunks.map((chunk, i) => ({
        documentId: document.id,
        chunkIndex: chunk.chunkIndex,
        section: chunk.section,
        text: chunk.text,
        tokenCount: chunk.tokenCount,
        embedding: JSON.stringify(embeddings[i]),
        embeddingModel: ingestionEnv.VOYAGE_MODEL,
      })),
    });

    return document.id;
  });

  return { status: "ingested", documentId, chunkCount: chunks.length };
}
