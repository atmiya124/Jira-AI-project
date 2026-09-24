/**
 * Standalone script to exercise the TWG-based Jira client in isolation.
 * Does not touch the Next.js app, any API route, or the UI. Read-only:
 * only fetches tickets, never posts a comment.
 *
 * Usage:
 *   npx tsx scripts/test-twg-jira.ts KAN-3
 */

export {}; // force module scope, avoids top-level name collisions with other scripts

try {
  process.loadEnvFile(".env.local");
} catch (err) {
  console.error("Could not load .env.local — make sure it exists at the project root.");
  throw err;
}

async function main() {
  const ticketKey = process.argv[2];
  if (!ticketKey) {
    console.error("Usage: npx tsx scripts/test-twg-jira.ts <TICKET_KEY>");
    process.exit(1);
  }

  const { fetchJiraIssueViaTwg } = await import("../src/lib/jira/twg/client");
  const { fetchJiraIssue: fetchJiraIssueViaRest } = await import("../src/lib/jira/client");

  console.log(`\n=== Fetching ${ticketKey} via TWG CLI ===`);
  const twgResult = await fetchJiraIssueViaTwg(ticketKey);
  console.log(JSON.stringify(twgResult, null, 2));

  console.log(`\n=== Fetching ${ticketKey} via existing REST client (for comparison) ===`);
  const restResult = await fetchJiraIssueViaRest(ticketKey);
  console.log(JSON.stringify(restResult, null, 2));

  console.log(`\n=== Diff summary ===`);
  console.log("summary match:   ", twgResult.fields.summary === restResult.fields.summary);
  console.log(
    "status match:    ",
    twgResult.fields.status?.name === restResult.fields.status?.name,
  );
  console.log(
    "issuetype match: ",
    twgResult.fields.issuetype?.name === restResult.fields.issuetype?.name,
  );
  console.log(
    "description match:",
    JSON.stringify(twgResult.fields.description) === JSON.stringify(restResult.fields.description),
  );
}

main().catch((err) => {
  console.error("Test script failed:", err);
  process.exit(1);
});
