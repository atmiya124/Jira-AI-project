import { env } from "@/lib/env";
import type { JiraIssue } from "@/types/jira";
import { JiraApiError } from "../errors";
import { runTwg } from "./runner";
import { jiraApiErrorFromTwgFailure } from "./errors";

/**
 * The Jira site TWG CLI should target, derived from the existing JIRA_BASE_URL
 * env var. Passed explicitly via the global `--site` flag (confirmed via
 * `twg --help`: it's a root-level option, not a per-subcommand one, and takes
 * a site prefix like "mycompany" rather than a full hostname) rather than
 * relying on TWG's "auto-selected if you have access to only one site"
 * behavior, so nothing changes silently if a second site is ever added.
 */
function resolveSiteHostname(): string {
  return new URL(env.JIRA_BASE_URL).hostname;
}

function resolveSitePrefix(): string {
  return resolveSiteHostname().split(".")[0];
}

/** Prepends the global `--site` flag, which must come before the subcommand path. */
function withSite(args: string[]): string[] {
  return ["--site", resolveSitePrefix(), ...args];
}

type TwgWorkitem = {
  key: string;
  summary: string;
  description: JiraIssue["fields"]["description"];
  status: JiraIssue["fields"]["status"];
  issuetype: JiraIssue["fields"]["issuetype"];
  url?: string;
};

type TwgGetResponse = {
  data: TwgWorkitem[];
};

/** TWG's `get` response has fields flattened at the top level (no `fields`
 * wrapper, unlike raw Jira REST). This remaps it into the existing JiraIssue
 * type so nothing downstream (adf.ts, analyze/route.ts) needs to change.
 */
function normalizeTwgWorkitem(item: TwgWorkitem): JiraIssue {
  return {
    key: item.key,
    fields: {
      summary: item.summary,
      description: item.description ?? null,
      status: item.status ?? null,
      issuetype: item.issuetype ?? null,
    },
  };
}

export async function fetchJiraIssueViaTwg(issueKey: string): Promise<JiraIssue> {
  const result = await runTwg<TwgGetResponse>(
    withSite(["jira", "workitem", "get", issueKey, "--full"]),
  );

  if (!result.ok) {
    throw jiraApiErrorFromTwgFailure(result.failure, `Fetching ticket ${issueKey} via TWG`);
  }

  const item = result.data?.data?.[0];
  if (!item) {
    throw new JiraApiError(`Fetching ticket ${issueKey} via TWG: not found`, 404);
  }

  return normalizeTwgWorkitem(item);
}

// Unlike `get`/`comment query` (collection-style, always array-wrapped),
// `comment create` returns a single created resource directly under `data`,
// not wrapped in an array. Confirmed via a live test response.
type TwgCommentCreateResponse = {
  data: { id: string };
};

export async function postJiraCommentViaTwg(
  issueKey: string,
  commentText: string,
): Promise<{ id: string }> {
  // --body-format defaults to "html" if omitted (confirmed via
  // `twg help describe "jira workitem comment create"`), which caused real
  // plain-text comments to fail whenever they happened to mention an HTML
  // tag name in prose (e.g. an AI suggestion saying "use a <button> element")
  // - TWG auto-detected/validated it as actual HTML and rejected it as
  // malformed. Our comment text is always plain text, so set this explicitly.
  const result = await runTwg<TwgCommentCreateResponse>(
    withSite([
      "jira",
      "workitem",
      "comment",
      "create",
      "--issue-id",
      issueKey,
      "--body",
      commentText,
      "--body-format",
      "plain",
    ]),
  );

  if (!result.ok) {
    throw jiraApiErrorFromTwgFailure(result.failure, `Posting comment on ${issueKey} via TWG`);
  }

  const id = result.data?.data?.id;
  if (!id) {
    throw new JiraApiError(
      `Posting comment on ${issueKey} via TWG: response did not include a comment id`,
      502,
    );
  }

  return { id };
}

export function jiraIssueUrlViaTwg(issueKey: string): string {
  return `https://${resolveSiteHostname()}/browse/${issueKey}`;
}
