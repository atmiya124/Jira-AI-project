import type { JiraIssue } from "@/types/jira";
import { fetchJiraIssueViaTwg, postJiraCommentViaTwg, jiraIssueUrlViaTwg } from "./twg/client";
import { fetchJiraIssueViaOAuth, postJiraCommentViaOAuth, jiraIssueUrlViaOAuth } from "./oauth/client";

export interface JiraProvider {
  fetchIssue(key: string): Promise<JiraIssue>;
  postComment(key: string, text: string): Promise<{ id: string }>;
  getIssueUrl(key: string): Promise<string>;
}

const twgJiraProvider: JiraProvider = {
  fetchIssue: fetchJiraIssueViaTwg,
  postComment: postJiraCommentViaTwg,
  getIssueUrl: async (key) => jiraIssueUrlViaTwg(key),
};

const oauthJiraProvider: JiraProvider = {
  fetchIssue: fetchJiraIssueViaOAuth,
  postComment: postJiraCommentViaOAuth,
  getIssueUrl: jiraIssueUrlViaOAuth,
};

/**
 * Explicit env var, not inferred from NODE_ENV/VERCEL - defaults to "twg" so
 * existing local dev behavior is unchanged with zero config changes, but
 * lets the OAuth provider be tested locally too before ever deploying.
 */
export function getJiraProvider(): JiraProvider {
  const selected = process.env.JIRA_PROVIDER ?? "twg";
  if (selected === "oauth") return oauthJiraProvider;
  if (selected === "twg") return twgJiraProvider;
  throw new Error(`Unknown JIRA_PROVIDER "${selected}" - expected "twg" or "oauth"`);
}
