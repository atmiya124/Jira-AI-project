import { runTwg } from "@/lib/jira/twg/runner";
import { ingestionEnv } from "../env";
import type { AcquiredDocument } from "../types";

function resolveSitePrefix(): string {
  return new URL(ingestionEnv.JIRA_BASE_URL).hostname.split(".")[0];
}

function withSite(args: string[]): string[] {
  return ["--site", resolveSitePrefix(), ...args];
}

// Confirmed via a live call against a real page. `data` is a single object
// (not array-wrapped), body HTML at `data.body.value`, timestamp at
// `data.metadata.version.createdAt`. `externalUrl` is absent for regular
// pages (likely only populated for smart-links/embeds), so sourceUrl is
// constructed from the pageId instead - see below.
type TwgConfluenceContentGetResponse = {
  data: {
    id: string;
    type: string;
    title: string;
    body?: { format: string; value: string };
    metadata?: { version?: { createdAt?: string } };
  };
};

export async function acquireConfluencePage(pageIdOrUrl: string): Promise<AcquiredDocument> {
  const result = await runTwg<TwgConfluenceContentGetResponse>(
    withSite([
      "confluence",
      "content",
      "get",
      pageIdOrUrl,
      "--detail",
      "full",
      "--format",
      "html",
      "--include-metadata",
    ]),
  );

  if (!result.ok) {
    throw new Error(
      `Fetching Confluence page ${pageIdOrUrl} via TWG failed: ${JSON.stringify(result.failure)}`,
    );
  }

  const page = result.data?.data;
  if (!page || !page.body?.value) {
    throw new Error(`Fetching Confluence page ${pageIdOrUrl} via TWG: no body content returned`);
  }

  return {
    source: "confluence",
    sourceId: page.id,
    title: page.title,
    sourceUrl: `https://${resolveSitePrefix()}.atlassian.net/wiki/pages/viewpage.action?pageId=${page.id}`,
    updatedAt: page.metadata?.version?.createdAt ?? null,
    rawContent: page.body.value,
    contentFormat: "html",
  };
}

// Confirmed via a live call: `data` is `{ results: [...], total, nextCursor }`,
// not `data: [...]` with `pageInfo` as originally guessed.
type TwgConfluenceListResponse = {
  data: {
    results: Array<{ id: string; title: string }>;
    total: number;
    nextCursor: string | null;
  };
};

export async function listConfluenceSpacePageIds(spaceKey: string): Promise<string[]> {
  const ids: string[] = [];
  let cursor: string | undefined;

  for (;;) {
    const result = await runTwg<TwgConfluenceListResponse>(
      withSite([
        "confluence",
        "content",
        "list",
        "--space",
        spaceKey,
        "--content-type",
        "page",
        "--limit",
        "100",
        ...(cursor ? ["--cursor", cursor] : []),
      ]),
    );

    if (!result.ok) {
      throw new Error(
        `Listing Confluence space ${spaceKey} via TWG failed: ${JSON.stringify(result.failure)}`,
      );
    }

    for (const item of result.data.data.results ?? []) ids.push(item.id);

    if (!result.data.data.nextCursor) break;
    cursor = result.data.data.nextCursor;
  }

  return ids;
}
