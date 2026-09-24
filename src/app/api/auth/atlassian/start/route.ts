import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildAuthorizeUrl } from "@/lib/jira/oauth/atlassianAuth";

export const STATE_COOKIE = "atlassian_oauth_state";

// Manual-trigger authorization entry point (visit this URL once to connect
// the app to your Atlassian site). Not linked from the UI yet - Step 2 only
// needs this to exist and work, not to be discoverable in the review flow.
export async function GET() {
  const state = randomBytes(24).toString("hex");
  const response = NextResponse.redirect(buildAuthorizeUrl(state));

  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
