import { NextResponse } from "next/server";
import { getNeedsReviewSections } from "@/lib/dashboard/queries";

/**
 * Read-only snapshot for the /needs-review page's 15s polling refresh.
 * Never mutates anything - the same shared query the server-rendered page
 * uses for its initial load.
 */
export async function GET() {
  const sections = await getNeedsReviewSections();
  return NextResponse.json(sections);
}
