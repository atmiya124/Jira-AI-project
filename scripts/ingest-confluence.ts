/**
 * Ingest a single Confluence page, or every page in a space, via TWG.
 *
 * Usage:
 *   npx tsx scripts/ingest-confluence.ts <pageIdOrUrl>
 *   npx tsx scripts/ingest-confluence.ts <spaceKey> --space
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
  const arg = process.argv[2];
  const isSpace = process.argv[3] === "--space";
  if (!arg) {
    console.error(
      "Usage: npx tsx scripts/ingest-confluence.ts <pageIdOrUrl>\n" +
        "       npx tsx scripts/ingest-confluence.ts <spaceKey> --space",
    );
    process.exit(1);
  }

  const { ingestConfluencePage, ingestConfluenceSpace } = await import(
    "../src/lib/ingestion/pipeline"
  );

  if (isSpace) {
    const results = await ingestConfluenceSpace(arg);
    console.log(JSON.stringify(results, null, 2));
    for (const r of results) await printDocument(r.documentId);
  } else {
    const result = await ingestConfluencePage(arg);
    console.log(JSON.stringify(result, null, 2));
    await printDocument(result.documentId);
  }
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
