/**
 * Run a semantic search query against the ingested knowledge base.
 * Read-only. Does not connect to the Request Enhancer or any LLM response
 * generation - just proves retrieval works.
 *
 * Usage:
 *   npx tsx scripts/test-semantic-search.ts "how do I reset a password"
 */

export {};

process.loadEnvFile(".env.local");

async function main() {
  const query = process.argv.slice(2).join(" ");
  if (!query) {
    console.error('Usage: npx tsx scripts/test-semantic-search.ts "your query"');
    process.exit(1);
  }

  const { semanticSearch } = await import("../src/lib/ingestion/search");
  const results = await semanticSearch(query, 5);

  console.log(`\nQuery: "${query}"`);
  console.log(`Results: ${results.length}\n`);

  for (const r of results) {
    console.log(
      `score=${r.score.toFixed(4)}  [${r.source}] ${r.documentTitle}${r.section ? ` > ${r.section}` : ""}`,
    );
    console.log(`  ${r.text.slice(0, 220).replace(/\n/g, " ")}...`);
    console.log();
  }
}

main().catch((err) => {
  console.error("Search failed:", err);
  process.exit(1);
});
