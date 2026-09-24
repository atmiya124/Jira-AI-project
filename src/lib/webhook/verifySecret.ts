import { timingSafeEqual } from "crypto";

/**
 * Simplest reliable secret check that works regardless of how the webhook
 * ends up registered (admin-configured UI webhook or dynamic API webhook) -
 * a shared secret passed as a URL query param, checked with a constant-time
 * comparison. Never logs the provided or expected value.
 */
export function isValidWebhookSecret(provided: string | null): boolean {
  const expected = process.env.JIRA_WEBHOOK_SECRET;
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}
