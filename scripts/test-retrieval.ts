/**
 * Standalone end-to-end test of the full Phase 1-4 pipeline:
 *   ticket key -> TWG fetch -> Request Enhancer -> retrievalQueries
 *   -> semantic search -> deduplicated, ranked RetrievalContext
 *
 * Does not generate a final AI response, does not post anything to Jira,
 * and does not touch the UI or any API route.
 *
 * Usage:
 *   npx tsx scripts/test-retrieval.ts KAN-4
 */

export {};

process.loadEnvFile(".env.local");

async function main() {
  const ticketKey = process.argv[2] ?? "KAN-4";

  const { fetchJiraIssueViaTwg, jiraIssueUrlViaTwg } = await import("../src/lib/jira/twg/client");
  const { enhanceRequest } = await import("../src/lib/enrichment/requestEnhancer");
  const { retrieveContext } = await import("../src/lib/retrieval/retrieveContext");

  console.log(`\n=== Step 1: Fetching ${ticketKey} via TWG ===`);
  const issue = await fetchJiraIssueViaTwg(ticketKey);
  const ticketUrl = jiraIssueUrlViaTwg(ticketKey);
  console.log("summary:", issue.fields.summary);
  console.log("status:", issue.fields.status?.name);

  console.log(`\n=== Step 2: Running Request Enhancer ===`);
  const enriched = await enhanceRequest({ issue, ticketUrl });
  console.log("category:", enriched.category);
  console.log("intent:", enriched.intent);
  console.log("retrievalQueries:");
  enriched.retrievalQueries.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));

  console.log(`\n=== Step 3: Semantic retrieval over KnowledgeChunk ===`);
  const context = await retrieveContext(enriched);

  console.log(`\nRetrieved ${context.chunks.length} deduplicated, ranked chunks:\n`);
  for (const chunk of context.chunks) {
    console.log(
      `score=${chunk.score.toFixed(4)}  [${chunk.source}] ${chunk.documentTitle}` +
        `${chunk.section ? ` > ${chunk.section}` : ""}`,
    );
    console.log(`  matchedQueries: ${JSON.stringify(chunk.matchedQueries)}`);
    console.log(`  sourceUrl: ${chunk.sourceUrl}`);
    console.log(`  text: "${chunk.text.slice(0, 200).replace(/\n/g, " ")}..."`);
    console.log();
  }

  const sopHit = context.chunks.some((c) => c.documentTitle === "Mobile Checkout Troubleshooting SOP");
  console.log(
    `Mobile Checkout Troubleshooting SOP present in results: ${sopHit ? "YES" : "NO"}`,
  );

  console.log("\n=== Full RetrievalContext JSON ===");
  console.log(JSON.stringify(context, null, 2));
}

main().catch((err) => {
  console.error("Retrieval test failed:", err);
  process.exit(1);
});
