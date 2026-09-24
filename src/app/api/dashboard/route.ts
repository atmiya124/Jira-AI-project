import { NextResponse } from "next/server";
import { getSummaryCounts, getNeedsReviewPreview, getRecentActivity } from "@/lib/dashboard/queries";

// Without this, Next.js can statically cache this GET route in production
// (no dynamic API usage of its own to signal otherwise), freezing every
// poll at whatever it returned first instead of reflecting new data.
export const dynamic = "force-dynamic";

const DASHBOARD_PREVIEW_LIMIT = 5;
const RECENT_ACTIVITY_LIMIT = 6;

/**
 * Read-only snapshot of the dashboard's data, polled client-side every 15s
 * to keep the page fresh without a full reload. Never mutates anything -
 * plain reads through the same shared queries the server-rendered page uses
 * for its initial load.
 */
export async function GET() {
  const [summary, needsReviewPreview, recentActivity] = await Promise.all([
    getSummaryCounts(),
    getNeedsReviewPreview(DASHBOARD_PREVIEW_LIMIT),
    getRecentActivity(RECENT_ACTIVITY_LIMIT),
  ]);

  return NextResponse.json({ summary, needsReviewPreview, recentActivity });
}
