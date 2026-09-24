import { z } from "zod";

/**
 * Scoped to the OAuth Jira provider only, deliberately separate from
 * src/lib/env.ts. Only evaluated when JIRA_PROVIDER=oauth actually
 * instantiates OAuthJiraProvider (or when an OAuth route is hit) - never
 * during normal TWG-based local dev, so these vars being unset can't break
 * the existing TWG path.
 */
const OAuthEnvSchema = z.object({
  ATLASSIAN_CLIENT_ID: z.string().min(1),
  ATLASSIAN_CLIENT_SECRET: z.string().min(1),
  ATLASSIAN_REDIRECT_URI: z.string().url(),
});

export function getOAuthEnv() {
  return OAuthEnvSchema.parse({
    ATLASSIAN_CLIENT_ID: process.env.ATLASSIAN_CLIENT_ID,
    ATLASSIAN_CLIENT_SECRET: process.env.ATLASSIAN_CLIENT_SECRET,
    ATLASSIAN_REDIRECT_URI: process.env.ATLASSIAN_REDIRECT_URI,
  });
}
