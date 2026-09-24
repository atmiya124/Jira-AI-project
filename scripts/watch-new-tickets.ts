/**
 * Long-running watcher: polls Jira every POLL_INTERVAL_MS for new tickets
 * (across all accessible projects) and runs the full grounded-response
 * pipeline for each one not yet in history, saving the result with
 * triggerSource "auto". Results land in the exact same History/review flow
 * as manually-triggered analyses - uses the same shared
 * runGroundedResponsePipeline() the /api/analyze route uses, so both paths
 * are guaranteed to behave identically.
 *
 * NEVER posts to Jira automatically - posting still requires the existing
 * explicit "Post comment to Jira" button in the app.
 *
 * Usage:
 *   npx tsx scripts/watch-new-tickets.ts          (runs forever, Ctrl+C to stop)
 *   npx tsx scripts/watch-new-tickets.ts --once    (single poll cycle, then exit)
 */

export {};

process.loadEnvFile(".env.local");

const POLL_INTERVAL_MS = 5 * 60 * 1000;
const LOOKBACK_DAYS = 1;
// Voyage's free tier is ~3 requests/min. Each ticket makes one Voyage call
// (batched retrieval embed); in practice a full pipeline run takes well over
// 20s anyway (dominated by two Claude calls), but this floor makes the
// safety margin explicit rather than incidental.
const MIN_GAP_BETWEEN_TICKETS_MS = 20 * 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fmt(keys: string[]): string {
  return keys.length ? ` (${keys.join(", ")})` : "";
}

async function processTicket(ticketKey: string) {
  const { runGroundedResponsePipeline } = await import(
    "../src/lib/pipeline/runGroundedResponsePipeline"
  );

  const { groundedResponse } = await runGroundedResponsePipeline({
    ticketKey,
    triggerSource: "auto",
  });
  return groundedResponse.confidence;
}

async function pollOnce() {
  const { findNewTicketKeys } = await import("../src/lib/watcher/pollForNewTickets");

  const checkedAt = new Date().toISOString();
  const { discovered, skipped, newKeys } = await findNewTicketKeys(LOOKBACK_DAYS);

  console.log(`[watcher] ---- Poll cycle: ${checkedAt} ----`);
  console.log(`[watcher] Discovered: ${discovered.length}${fmt(discovered)}`);
  console.log(`[watcher] Skipped (already processed): ${skipped.length}${fmt(skipped)}`);
  console.log(`[watcher] New to process: ${newKeys.length}${fmt(newKeys)}`);

  const processed: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < newKeys.length; i++) {
    const key = newKeys[i];
    try {
      const confidence = await processTicket(key);
      console.log(`[watcher]   -> ${key}: saved to history (confidence: ${confidence})`);
      processed.push(key);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[watcher]   -> ${key}: FAILED - ${message}`);
      console.error(`[watcher]      Will retry ${key} on the next poll cycle.`);
      failed.push(key);
    }

    if (i < newKeys.length - 1) {
      await sleep(MIN_GAP_BETWEEN_TICKETS_MS);
    }
  }

  console.log(`[watcher] Processed: ${processed.length}${fmt(processed)}`);
  console.log(`[watcher] Failures: ${failed.length}${fmt(failed)}`);
  console.log(`[watcher] ---- Cycle complete ----`);
}

async function main() {
  const runOnce = process.argv.includes("--once");

  if (runOnce) {
    await pollOnce();
    process.exit(0);
  }

  console.log(`[watcher] Starting. Polling every ${POLL_INTERVAL_MS / 1000}s. Ctrl+C to stop.`);

  let running = true;
  process.on("SIGINT", () => {
    console.log("\n[watcher] Stopping...");
    running = false;
    process.exit(0);
  });

  while (running) {
    await pollOnce().catch((err) => {
      console.error("[watcher] Poll cycle failed:", err instanceof Error ? err.message : err);
    });
    await sleep(POLL_INTERVAL_MS);
  }
}

main();
