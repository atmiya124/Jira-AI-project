import { getOAuthEnv } from "./env";

/**
 * Verified directly against Jira's OpenAPI spec (x-atlassian-oauth2-scopes
 * per operation), not secondary docs - granular scopes turned out to require
 * 8-9 bundled scopes per endpoint (still Beta), not a single narrow one.
 *
 * Read (GET /rest/api/3/issue/{key}): classic `read:jira-work`. Reading
 * issue data isn't the write-capability risk that matters here, and classic
 * is what Atlassian itself recommends and is not Beta.
 *
 * Write (POST /rest/api/3/issue/{key}/comment): the full granular Beta
 * scope bundle required by the spec, so the WRITE capability itself stays
 * structurally limited to comments only - deliberately NOT `write:jira-work`,
 * which would also permit issue edit/transition/delete at the token level.
 */
const SCOPES = [
  "offline_access",
  "read:jira-work",
  "write:comment:jira",
  "read:comment:jira",
  "read:comment.property:jira",
  "read:group:jira",
  "read:project:jira",
  "read:project-role:jira",
  "read:user:jira",
  "read:avatar:jira",
];

const AUTHORIZE_URL = "https://auth.atlassian.com/authorize";
const TOKEN_URL = "https://auth.atlassian.com/oauth/token";
const ACCESSIBLE_RESOURCES_URL = "https://api.atlassian.com/oauth/token/accessible-resources";

export function buildAuthorizeUrl(state: string): string {
  const env = getOAuthEnv();
  const params = new URLSearchParams({
    audience: "api.atlassian.com",
    client_id: env.ATLASSIAN_CLIENT_ID,
    scope: SCOPES.join(" "),
    redirect_uri: env.ATLASSIAN_REDIRECT_URI,
    state,
    response_type: "code",
    prompt: "consent",
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const env = getOAuthEnv();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: env.ATLASSIAN_CLIENT_ID,
      client_secret: env.ATLASSIAN_CLIENT_SECRET,
      code,
      redirect_uri: env.ATLASSIAN_REDIRECT_URI,
    }),
  });
  if (!res.ok) {
    throw new Error(`Atlassian token exchange failed with status ${res.status}`);
  }
  return (await res.json()) as TokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const env = getOAuthEnv();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: env.ATLASSIAN_CLIENT_ID,
      client_secret: env.ATLASSIAN_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) {
    throw new Error(`Atlassian token refresh failed with status ${res.status}`);
  }
  return (await res.json()) as TokenResponse;
}

export type AccessibleResource = {
  id: string; // cloudId
  url: string; // site URL, e.g. https://your-domain.atlassian.net
  scopes: string[];
};

export async function fetchAccessibleResources(accessToken: string): Promise<AccessibleResource[]> {
  const res = await fetch(ACCESSIBLE_RESOURCES_URL, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Atlassian accessible-resources lookup failed with status ${res.status}`);
  }
  return (await res.json()) as AccessibleResource[];
}
