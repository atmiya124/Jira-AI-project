import { NextResponse } from "next/server";

export async function GET() {
  const jiraConfigured = Boolean(
    process.env.JIRA_BASE_URL && process.env.JIRA_EMAIL && process.env.JIRA_API_TOKEN,
  );
  const anthropicConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

  return NextResponse.json({
    ok: jiraConfigured && anthropicConfigured,
    jiraConfigured,
    anthropicConfigured,
  });
}
