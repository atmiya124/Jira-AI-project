/**
 * Standalone script to exercise the Request Enhancer in isolation.
 * Does not touch the Next.js app, any API route, the UI, or the database.
 * Read-only against Jira (fetch only, no writes) plus one Claude call.
 *
 * Usage:
 *   npx tsx scripts/test-enhance-request.ts KAN-4
 */

export {}; // force module scope, avoids top-level name collisions with other scripts

process.loadEnvFile(".env.local");

type RawWorkitem = {
  priority?: { name?: string } | null;
  attachment?: Array<{ filename: string; mimeType?: string; size?: number; content?: string }>;
};

async function main() {
  const ticketKey = process.argv[2] ?? "KAN-4";

  const { fetchJiraIssueViaTwg, jiraIssueUrlViaTwg } = await import("../src/lib/jira/twg/client");
  const { runTwg } = await import("../src/lib/jira/twg/runner");
  const { enhanceRequest } = await import("../src/lib/enrichment/requestEnhancer");

  console.log(`\n=== Fetching ${ticketKey} via TWG (normalized) ===`);
  const issue = await fetchJiraIssueViaTwg(ticketKey);
  const ticketUrl = jiraIssueUrlViaTwg(ticketKey);
  console.log(JSON.stringify(issue, null, 2));

  // Pull priority/attachments straight from the raw response for a fuller
  // EnhancerInput demo. This bypasses the normalized JiraIssue contract
  // entirely (does not modify or extend it) — read-only, isolated to this
  // test script.
  console.log(`\n=== Fetching raw priority/attachments for ${ticketKey} ===`);
  const rawResult = await runTwg<{ data: RawWorkitem[] }>([
    "--site",
    new URL(process.env.JIRA_BASE_URL!).hostname.split(".")[0],
    "jira",
    "workitem",
    "get",
    ticketKey,
    "--full",
  ]);

  let priority: string | null = null;
  let attachments: Array<{ filename: string; mimeType?: string; sizeBytes?: number; url?: string }> = [];
  if (rawResult.ok) {
    const raw = rawResult.data.data[0];
    priority = raw?.priority?.name ?? null;
    attachments = (raw?.attachment ?? []).map((a) => ({
      filename: a.filename,
      mimeType: a.mimeType,
      sizeBytes: a.size,
      url: a.content,
    }));
  }
  console.log("priority:", priority);
  console.log("attachments:", JSON.stringify(attachments, null, 2));

  console.log(`\n=== Running enhanceRequest() ===`);
  const enriched = await enhanceRequest({ issue, ticketUrl, priority, attachments });
  console.log(JSON.stringify(enriched, null, 2));
}

main().catch((err) => {
  console.error("Test script failed:", err);
  process.exit(1);
});
