/**
 * Ingest a local markdown/SOP file.
 *
 * Usage:
 *   npx tsx scripts/ingest-local.ts ./knowledge/sample-sop.md
 */

export {};

process.loadEnvFile(".env.local");

async function printDocument(documentId: string) {
  const { prisma } = await import("../src/lib/db/prisma");
  const doc = await prisma.knowledgeDocument.findUnique({
    where: { id: documentId },
    include: { chunks: { orderBy: { chunkIndex: "asc" } } },
  });
  if (!doc) return;

  console.log(`\n--- ${doc.title} (${doc.source}/${doc.sourceId}) ---`);
  console.log("sourceUrl:", doc.sourceUrl);
  console.log("updatedAt:", doc.updatedAt);
  console.log("contentHash:", doc.contentHash);
  console.log(`chunks: ${doc.chunks.length}`);
  for (const c of doc.chunks) {
    const embedding = JSON.parse(c.embedding) as number[];
    console.log(
      `  [${c.chunkIndex}] section="${c.section ?? "(none)"}" tokens=${c.tokenCount} ` +
        `embeddingDims=${embedding.length} model=${c.embeddingModel}`,
    );
    console.log(`      "${c.text.slice(0, 160).replace(/\n/g, " ")}..."`);
  }
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx scripts/ingest-local.ts <path-to-markdown-file>");
    process.exit(1);
  }

  const { ingestMarkdownFile } = await import("../src/lib/ingestion/pipeline");
  const result = await ingestMarkdownFile(filePath);
  console.log(JSON.stringify(result, null, 2));
  await printDocument(result.documentId);
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
