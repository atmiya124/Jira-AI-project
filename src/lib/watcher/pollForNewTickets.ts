import { runTwg } from "@/lib/jira/twg/runner";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";

function resolveSitePrefix(): string {
  return new URL(env.JIRA_BASE_URL).hostname.split(".")[0];
}

// Confirmed via a live call: collection path is `data.issues[]` - distinct
// from both `jira workitem get` (`data[]`) and `confluence content list`
// (`data.results[]`). Each TWG command has its own convention; never assumed.
type TwgQueryResponse = {
  data: {
    issues: Array<{ key: string; summary: string; created: string }>;
  };
};

export type PollResult = {
  discovered: string[]; // every candidate found by the JQL window this cycle
  skipped: string[]; // already had an Analysis record - not reprocessed
  newKeys: string[]; // not yet processed - these should run through the pipeline
};

/**
 * Finds ticket keys created within the lookback window and splits them into
 * already-processed (skipped) vs. new. An "already processed" ticket is one
 * with any existing Analysis record (manual or auto - either way, a human
 * has already seen it in the app). The DB existence check is the
 * authoritative dedup guard, not the query window, so this is safe to call
 * with a generous/overlapping window and safe across watcher restarts.
 */
export async function findNewTicketKeys(lookbackDays = 1): Promise<PollResult> {
  const result = await runTwg<TwgQueryResponse>([
    "--site",
    resolveSitePrefix(),
    "jira",
    "workitem",
    "query",
    "--jql",
    `created >= -${lookbackDays}d ORDER BY created ASC`,
    "--fields",
    "key,summary,created",
    "--limit",
    "100",
  ]);

  if (!result.ok) {
    throw new Error(`Polling for new tickets via TWG failed: ${JSON.stringify(result.failure)}`);
  }

  const discovered = result.data.data.issues.map((issue) => issue.key);
  if (discovered.length === 0) return { discovered: [], skipped: [], newKeys: [] };

  const existing = await prisma.analysis.findMany({
    where: { ticketKey: { in: discovered } },
    select: { ticketKey: true },
  });
  const alreadyProcessed = new Set(existing.map((r) => r.ticketKey));

  const skipped = discovered.filter((key) => alreadyProcessed.has(key));
  const newKeys = discovered.filter((key) => !alreadyProcessed.has(key));

  return { discovered, skipped, newKeys };
}
