-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketKey" TEXT NOT NULL,
    "ticketUrl" TEXT NOT NULL,
    "ticketSummary" TEXT NOT NULL,
    "ticketDescription" TEXT NOT NULL,
    "ticketStatus" TEXT,
    "ticketType" TEXT,
    "model" TEXT NOT NULL,
    "analysisJson" TEXT NOT NULL,
    "draftComment" TEXT NOT NULL,
    "estimatedComplexity" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentPosted" BOOLEAN NOT NULL DEFAULT false,
    "commentPostedAt" DATETIME,
    "jiraCommentId" TEXT
);

-- CreateIndex
CREATE INDEX "Analysis_ticketKey_idx" ON "Analysis"("ticketKey");

-- CreateIndex
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");
