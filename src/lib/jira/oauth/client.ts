import type { JiraIssue } from "@/types/jira";
import { JiraApiError, jiraErrorFromResponse } from "../errors";
import { plainTextToMinimalAdf } from "../adf";
import { getStoredToken, saveToken, type StoredToken } from "./tokenStore";
import { refreshAccessToken } from "./atlassianAuth";

// Refresh a bit before actual expiry to avoid a request racing an
// about-to-expire token.
const REFRESH_BUFFER_MS = 60_000;

async function ensureAccessToken(): Promise<StoredToken> {
  const stored = await getStoredToken();
  if (!stored) {
    throw new JiraApiError(
      "No Atlassian OAuth token found. Complete the OAuth authorization flow (/api/auth/atlassian/start) first.",
      401,
    );
  }

  if (stored.expiresAt.getTime() - REFRESH_BUFFER_MS > Date.now()) {
    return stored;
  }

  // Atlassian issues ROTATING refresh tokens: each refresh invalidates the
  // previous refresh token and returns a new one, which must be persisted or
  // the next refresh will fail.
  const refreshed = await refreshAccessToken(stored.refreshToken);
  const updated: StoredToken = {
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    cloudId: stored.cloudId,
    siteUrl: stored.siteUrl,
    expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
  };
  await saveToken(updated);
  return updated;
}

function apiBaseUrl(cloudId: string): string {
  return `https://api.atlassian.com/ex/jira/${cloudId}`;
}

async function oauthFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await ensureAccessToken();
  try {
    return await fetch(`${apiBaseUrl(token.cloudId)}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        Accept: "application/json",
        ...init?.headers,
      },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new JiraApiError("Could not reach Jira via the Atlassian OAuth API.", 0);
  }
}

export async function fetchJiraIssueViaOAuth(issueKey: string): Promise<JiraIssue> {
  const res = await oauthFetch(
    `/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,description,status,issuetype`,
  );
  if (!res.ok) {
    throw await jiraErrorFromResponse(res, `Fetching ticket ${issueKey} via OAuth`);
  }
  return (await res.json()) as JiraIssue;
}

export async function postJiraCommentViaOAuth(
  issueKey: string,
  commentText: string,
): Promise<{ id: string }> {
  const res = await oauthFetch(`/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: plainTextToMinimalAdf(commentText) }),
  });
  if (!res.ok) {
    throw await jiraErrorFromResponse(res, `Posting comment on ${issueKey} via OAuth`);
  }
  const data = (await res.json()) as { id: string };
  return { id: data.id };
}

export async function jiraIssueUrlViaOAuth(issueKey: string): Promise<string> {
  const token = await getStoredToken();
  if (!token) {
    throw new JiraApiError(
      "No Atlassian OAuth token found. Complete the OAuth authorization flow (/api/auth/atlassian/start) first.",
      401,
    );
  }
  return `${token.siteUrl}/browse/${issueKey}`;
}
