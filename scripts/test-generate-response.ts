/**
 * Standalone end-to-end test of the full Phase 1-5 pipeline:
 *   ticket key -> TWG fetch -> Request Enhancer -> retrieval
 *   -> grounded response generation
 *
 * Does not post anything to Jira, does not touch the UI or any API route.
 *
 * Usage:
 *   npx tsx scripts/test-generate-response.ts KAN-4
 */

export {};

process.loadEnvFile(".env.local");

async function main() {
  const ticketKey = process.argv[2] ?? "KAN-4";

  const { fetchJiraIssueViaTwg, jiraIssueUrlViaTwg } = await import("../src/lib/jira/twg/client");
  const { enhanceRequest } = await import("../src/lib/enrichment/requestEnhancer");
  const { retrieveContext } = await import("../src/lib/retrieval/retrieveContext");
  const { generateGroundedResponse } = await import("../src/lib/generation/generateResponse");

  console.log(`\n=== Step 1: Fetching ${ticketKey} via TWG ===`);
  const issue = await fetchJiraIssueViaTwg(ticketKey);
  const ticketUrl = jiraIssueUrlViaTwg(ticketKey);
  console.log("summary:", issue.fields.summary);

  console.log(`\n=== Step 2: Request Enhancer ===`);
  const enriched = await enhanceRequest({ issue, ticketUrl });
  console.log("retrievalQueries:", enriched.retrievalQueries);

  console.log(`\n=== Step 3: Retrieval ===`);
  const context = await retrieveContext(enriched);
  console.log(`Retrieved ${context.chunks.length} chunks:`);
  for (const c of context.chunks) {
    console.log(
      `  - [${c.source}] ${c.documentTitle}${c.section ? ` > ${c.section}` : ""} (score ${c.score.toFixed(3)})`,
    );
  }

  console.log(`\n=== Step 4: Grounded Response Generation ===`);
  const grounded = await generateGroundedResponse(enriched, context);

  console.log("\n--- summary ---");
  console.log(grounded.summary);

  console.log("\n--- suggestedResponse ---");
  console.log(grounded.suggestedResponse);

  console.log("\n--- recommendedActions ---");
  grounded.recommendedActions.forEach((a) => console.log(`  - ${a}`));

  console.log("\n--- missingInformation ---");
  if (grounded.missingInformation.length === 0) console.log("  (none)");
  grounded.missingInformation.forEach((m) => console.log(`  - ${m}`));

  console.log("\n--- confidence ---");
  console.log(grounded.confidence);

  console.log("\n--- sourcesUsed ---");
  if (grounded.sourcesUsed.length === 0) console.log("  (none)");
  grounded.sourcesUsed.forEach((s) =>
    console.log(
      `  - ${s.documentTitle}${s.section ? ` > ${s.section}` : ""} | ${s.sourceUrl ?? "no url"} | score=${s.score.toFixed(3)}`,
    ),
  );

  console.log("\n=== Verification ===");

  const retrievedChunkIds = new Set(context.chunks.map((c) => c.chunkId));
  const allSourcesValid = grounded.sourcesUsed.every((s) => retrievedChunkIds.has(s.chunkId));
  console.log(
    `All sourcesUsed map to an actual retrieved chunk: ${allSourcesValid ? "YES" : "NO -- BUG"}`,
  );

  const usedPasswordResetSop = grounded.sourcesUsed.some(
    (s) => s.documentTitle === "Password Reset and Authentication Troubleshooting SOP",
  );
  console.log(
    `Password Reset SOP used as a source: ${usedPasswordResetSop ? "YES -- unexpected" : "NO -- correct"}`,
  );

  console.log("\n=== Full GroundedResponse JSON ===");
  console.log(JSON.stringify(grounded, null, 2));
}

main().catch((err) => {
  console.error("Response generation test failed:", err);
  process.exit(1);
});
