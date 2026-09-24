export class JiraApiError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = "JiraApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export async function jiraErrorFromResponse(res: Response, context: string): Promise<JiraApiError> {
  switch (res.status) {
    case 404:
      return new JiraApiError(`${context}: not found`, 404);
    case 401:
      return new JiraApiError(
        `${context}: Jira authentication failed. Check JIRA_EMAIL and JIRA_API_TOKEN.`,
        401,
      );
    case 403:
      return new JiraApiError(`${context}: this Jira account does not have access.`, 403);
    case 429: {
      const retryAfter = Number(res.headers.get("Retry-After"));
      return new JiraApiError(
        `${context}: Jira rate limit hit.${Number.isFinite(retryAfter) ? ` Retry in ${retryAfter}s.` : ""}`,
        429,
        Number.isFinite(retryAfter) ? retryAfter : undefined,
      );
    }
    default: {
      const body = await res.text().catch(() => "");
      return new JiraApiError(
        `${context}: Jira request failed with status ${res.status}. ${body.slice(0, 300)}`,
        res.status,
      );
    }
  }
}
