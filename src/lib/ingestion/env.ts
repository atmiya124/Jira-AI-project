import { z } from "zod";

/**
 * Scoped to the ingestion feature only, deliberately separate from
 * src/lib/env.ts (the core app's env). This is eager-parsed at import time
 * like the core one, but since nothing under src/app/** imports anything
 * from src/lib/ingestion/**, it's only evaluated when an ingestion script
 * explicitly runs - never during normal `npm run dev`/build of the main app.
 * That means an unset VOYAGE_API_KEY can never break the core Jira/analysis
 * app, only ingestion scripts that need it.
 */
const IngestionEnvSchema = z.object({
  VOYAGE_API_KEY: z.string().min(1),
  VOYAGE_MODEL: z.string().default("voyage-3-lite"),
  KNOWLEDGE_LOCAL_DIR: z.string().default("./knowledge"),
  JIRA_BASE_URL: z.string().url(), // reused to derive the TWG site prefix, same as jira/twg/client.ts
});

export const ingestionEnv = IngestionEnvSchema.parse({
  VOYAGE_API_KEY: process.env.VOYAGE_API_KEY,
  VOYAGE_MODEL: process.env.VOYAGE_MODEL,
  KNOWLEDGE_LOCAL_DIR: process.env.KNOWLEDGE_LOCAL_DIR,
  JIRA_BASE_URL: process.env.JIRA_BASE_URL,
});
