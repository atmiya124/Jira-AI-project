import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { isValidWebhookSecret } from "@/lib/webhook/verifySecret";
import { processAutoTicket } from "@/lib/webhook/processAutoTicket";

const SUPPORTED_EVENT = "jira:issue_created";

/**
 * The `after()` callback (processAutoTicket -> the full RAG pipeline) runs
 * as part of this same function invocation's lifetime on Vercel, not a
 * separate one - so this ceiling covers the initial fast ack AND the
 * deferred pipeline work, not just the response. Observed pipeline runtime
 * is ~15-40s (two Claude calls + one Voyage call dominate); 60s leaves
 * comfortable headroom without over-provisioning. Requires the Vercel
 * project to actually support this duration for background `after()` work
 * (see deployment notes - Fluid Compute must be verified, not assumed).
 */
export const maxDuration = 60;

const WebhookPayloadSchema = z.object({
  webhookEvent: z.string().optional(),
  issue: z.object({ key: z.string().min(1) }).optional(),
});

/**
 * Production entry point for automatic ticket ingestion, replacing the local
 * polling watcher's job once deployed. Never posts to Jira - this only ever
 * schedules the same read-and-save pipeline the manual /api/analyze route
 * and the watcher already use. Posting stays exclusively behind the
 * explicit "Post comment to Jira" button.
 */
export async function POST(request: NextRequest) {
  console.log("[webhook] Received");

  const secret = request.nextUrl.searchParams.get("secret");
  if (!isValidWebhookSecret(secret)) {
    console.warn("[webhook] Rejected: invalid or missing secret");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = WebhookPayloadSchema.safeParse(body);
  if (!parsed.success) {
    console.warn("[webhook] Rejected: malformed payload");
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const { webhookEvent, issue } = parsed.data;
  if (webhookEvent !== SUPPORTED_EVENT) {
    console.log(`[webhook] Ignored event: ${webhookEvent ?? "(missing)"}`);
    return NextResponse.json({ ok: true, ignored: true });
  }

  const ticketKey = issue?.key;
  if (!ticketKey) {
    console.warn("[webhook] Rejected: issue_created event missing issue.key");
    return NextResponse.json({ error: "Missing issue.key" }, { status: 400 });
  }

  console.log(`[webhook] Ticket key: ${ticketKey}`);

  // Fast idempotency pre-check: specifically an existing auto-RAG analysis,
  // not "any analysis" - manual and automatic analyses are allowed to
  // coexist. This is the common-case guard (e.g. Jira retrying the same
  // delivery); the DB-level unique constraint in runGroundedResponsePipeline
  // is the race-safety net for near-simultaneous deliveries that both pass
  // this check before either has committed.
  const existing = await prisma.analysis.findFirst({
    where: { ticketKey, pipelineType: "rag", triggerSource: "auto" },
    select: { id: true },
  });
  if (existing) {
    console.log(`[webhook] Duplicate skipped: ${ticketKey} (existing analysis ${existing.id})`);
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Acknowledge Jira immediately; the actual AI/RAG pipeline continues via
  // `after()` (Next.js's wrapper around Vercel's waitUntil) after this
  // response has already been sent, so Jira never waits on it.
  after(() => processAutoTicket(ticketKey));

  return NextResponse.json({ ok: true, accepted: true });
}
