import { runGroundedResponsePipeline } from "@/lib/pipeline/runGroundedResponsePipeline";

/**
 * The actual work done for one automatically-detected ticket, deliberately
 * isolated from the webhook route itself. Today the route hands this to
 * `after()` directly; later it can be handed to `queue.enqueue(processAutoTicket)`
 * instead (Vercel Queues, QStash, etc.) without this function - or the
 * shared pipeline it calls - changing at all.
 *
 * Never throws - the caller (running in `after()`, after the HTTP response
 * has already been sent) has no one left to report a thrown error to, so
 * failures are logged here instead. The ticket simply stays unprocessed and
 * can be picked up by a retried webhook delivery, the local watcher
 * fallback, or a manual analysis.
 */
export async function processAutoTicket(ticketKey: string): Promise<void> {
  console.log(`[webhook] Processing started: ${ticketKey}`);
  try {
    const { record } = await runGroundedResponsePipeline({ ticketKey, triggerSource: "auto" });
    console.log(`[webhook] Processing completed: ${ticketKey} (analysis id: ${record.id})`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[webhook] Processing failed: ${ticketKey} - ${message}`);
  }
}
