import { env } from "@/lib/env";
import type { JiraIssue } from "@/types/jira";
import { jiraErrorFromResponse, JiraApiError } from "./errors";
import { plainTextToMinimalAdf } from "./adf";

function authHeader(): string {
  const token = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString("base64");
  return `Basic ${token}`;
}

function baseHeaders(): HeadersInit {
  return {
    Authorization: authHeader(),
    Accept: "application/json",
  };
}

async function jiraFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${env.JIRA_BASE_URL}${path}`, {
      ...init,
      headers: { ...baseHeaders(), ...init?.headers },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new JiraApiError(
      "Could not reach Jira. Check JIRA_BASE_URL and your network connection.",
      0,
    );
  }
}

export async function fetchJiraIssue(issueKey: string): Promise<JiraIssue> {
  const res = await jiraFetch(
    `/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,description,status,issuetype`,
  );

  if (!res.ok) {
    throw await jiraErrorFromResponse(res, `Fetching ticket ${issueKey}`);
  }

  return (await res.json()) as JiraIssue;
}

export async function postJiraComment(
  issueKey: string,
  commentText: string,
): Promise<{ id: string }> {
  const res = await jiraFetch(`/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: plainTextToMinimalAdf(commentText) }),
  });

  if (!res.ok) {
    throw await jiraErrorFromResponse(res, `Posting comment on ${issueKey}`);
  }

  const data = (await res.json()) as { id: string };
  return { id: data.id };
}

export function jiraIssueUrl(issueKey: string): string {
  return `${env.JIRA_BASE_URL}/browse/${issueKey}`;
}
