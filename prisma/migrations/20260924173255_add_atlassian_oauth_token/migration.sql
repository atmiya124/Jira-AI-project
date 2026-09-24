-- CreateTable
CREATE TABLE "AtlassianOAuthToken" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "cloudId" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AtlassianOAuthToken_pkey" PRIMARY KEY ("id")
);
