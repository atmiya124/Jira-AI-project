import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  exchangeCodeForToken,
  fetchAccessibleResources,
} from "@/lib/jira/oauth/atlassianAuth";
import { saveToken } from "@/lib/jira/oauth/tokenStore";
import { STATE_COOKIE } from "../start/route";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.json({ error: "Invalid or missing OAuth state" }, { status: 400 });
  }

  const tokenResponse = await exchangeCodeForToken(code);
  const resources = await fetchAccessibleResources(tokenResponse.access_token);

  // Resource-restricted 3LO: only accept the one Jira site this app is
  // actually configured for, rather than trusting whichever site the user
  // happened to authorize.
  const expectedHost = new URL(env.JIRA_BASE_URL).hostname;
  const matched = resources.find((r) => new URL(r.url).hostname === expectedHost);

  if (!matched) {
    return NextResponse.json(
      {
        error: `Authorized Atlassian account does not have access to ${expectedHost}`,
        availableSites: resources.map((r) => r.url),
      },
      { status: 403 },
    );
  }

  await saveToken({
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    cloudId: matched.id,
    siteUrl: matched.url,
    expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
  });

  const response = NextResponse.json({ ok: true, site: matched.url });
  response.cookies.delete(STATE_COOKIE);
  return response;
}
