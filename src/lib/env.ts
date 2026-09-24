import { z } from "zod";

const CoreEnvSchema = z.object({
  JIRA_BASE_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-5"),
});

/**
 * JIRA_EMAIL/JIRA_API_TOKEN are only consumed by the legacy Basic-auth REST
 * client (src/lib/jira/client.ts), which the active JiraProvider selector
 * never wires up in either mode (TWG or OAuth) - but this schema is still
 * validated eagerly at import time, so it must not demand these when
 * JIRA_PROVIDER=oauth. Kept required (existing behavior, unchanged) for any
 * other value of JIRA_PROVIDER so local TWG/watcher usage is unaffected.
 * Both branches keep the field typed as a plain `string` (never optional),
 * so nothing downstream needs to change.
 */
const JiraAuthEnvSchema =
  process.env.JIRA_PROVIDER === "oauth"
    ? z.object({
        JIRA_EMAIL: z.string().default(""),
        JIRA_API_TOKEN: z.string().default(""),
      })
    : z.object({
        JIRA_EMAIL: z.string().email(),
        JIRA_API_TOKEN: z.string().min(1),
      });

const EnvSchema = CoreEnvSchema.merge(JiraAuthEnvSchema);

export const env = EnvSchema.parse({
  JIRA_BASE_URL: process.env.JIRA_BASE_URL,
  JIRA_EMAIL: process.env.JIRA_EMAIL,
  JIRA_API_TOKEN: process.env.JIRA_API_TOKEN,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
});
