import { prisma } from "@/lib/db/prisma";

const SINGLETON_ID = "default";

export type StoredToken = {
  accessToken: string;
  refreshToken: string;
  cloudId: string;
  siteUrl: string;
  expiresAt: Date;
};

export async function getStoredToken(): Promise<StoredToken | null> {
  const row = await prisma.atlassianOAuthToken.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) return null;
  return {
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
    cloudId: row.cloudId,
    siteUrl: row.siteUrl,
    expiresAt: row.expiresAt,
  };
}

export async function saveToken(token: StoredToken): Promise<void> {
  await prisma.atlassianOAuthToken.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...token },
    update: { ...token },
  });
}
