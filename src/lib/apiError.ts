import { NextResponse } from "next/server";
import { JiraApiError } from "@/lib/jira/errors";

export type ApiErrorBody = { error: { code: string; message: string } };

export function jiraErrorResponse(err: JiraApiError): NextResponse<ApiErrorBody> {
  const status = err.status >= 400 && err.status < 600 ? err.status : 502;
  const code =
    err.status === 404
      ? "TICKET_NOT_FOUND"
      : err.status === 401
        ? "JIRA_AUTH_FAILED"
        : err.status === 403
          ? "JIRA_FORBIDDEN"
          : err.status === 429
            ? "JIRA_RATE_LIMITED"
            : "JIRA_ERROR";

  return NextResponse.json({ error: { code, message: err.message } }, { status });
}

export function errorResponse(code: string, message: string, status: number): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code, message } }, { status });
}
