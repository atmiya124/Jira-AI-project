import { JiraApiError } from "../errors";
import type { TwgRunFailure } from "./runner";

/**
 * Maps a TWG CLI run failure onto the SAME JiraApiError class used by the
 * existing REST integration, so downstream code (API routes, apiError.ts)
 * does not need to change regardless of which Jira provider is active.
 *
 * Confirmed by testing a not-found ticket: TWG's error payload includes an
 * explicit `statusCode` (404 in that case) mirroring the underlying Jira REST
 * status, so that's used directly wherever present — the same reliable
 * signal the REST path already keys off of. Message-text matching is only a
 * fallback for cases without a statusCode. Auth-failure and rate-limit
 * examples have not been observed yet; those branches are best-effort.
 */
export function jiraApiErrorFromTwgFailure(failure: TwgRunFailure, context: string): JiraApiError {
  switch (failure.kind) {
    case "missing_executable":
      return new JiraApiError(`${context}: ${failure.message}`, 0);

    case "timeout":
      return new JiraApiError(`${context}: ${failure.message}`, 0);

    case "invalid_json":
      return new JiraApiError(`${context}: ${failure.message}`, 502);

    case "spawn_error":
      return new JiraApiError(`${context}: ${failure.message}`, 502);

    case "twg_error": {
      const { code, message, statusCode, retry } = failure.error;

      if (statusCode === 404) {
        // TWG conflates "doesn't exist" and "no permission to see it" into one
        // message/status, same ambiguity real Jira's REST API has by design.
        return new JiraApiError(`${context}: not found`, 404);
      }
      if (statusCode === 401) {
        return new JiraApiError(
          `${context}: TWG authentication failed. Run "twg login" to re-authenticate.`,
          401,
        );
      }
      if (statusCode === 403) {
        return new JiraApiError(`${context}: this Jira account does not have access.`, 403);
      }
      if (statusCode === 429) {
        return new JiraApiError(`${context}: TWG/Jira rate limit hit.`, 429);
      }

      // No statusCode observed on this error — fall back to message matching.
      const lower = message.toLowerCase();
      if (lower.includes("does not exist") || lower.includes("not found")) {
        return new JiraApiError(`${context}: not found`, 404);
      }
      if (lower.includes("not signed in") || lower.includes("unauthenticated") || lower.includes("token")) {
        return new JiraApiError(
          `${context}: TWG authentication failed. Run "twg login" to re-authenticate.`,
          401,
        );
      }
      if (lower.includes("rate limit") || lower.includes("too many requests")) {
        return new JiraApiError(`${context}: TWG/Jira rate limit hit.`, 429);
      }

      const retrySuffix = retry?.recommended ? " This may be transient — retrying may help." : "";
      return new JiraApiError(
        `${context}: TWG error (${code}): ${message}${retrySuffix}`,
        statusCode ?? 502,
      );
    }

    default:
      return new JiraApiError(`${context}: Unknown TWG failure.`, 502);
  }
}
