-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketKey" TEXT NOT NULL,
    "ticketUrl" TEXT NOT NULL,
    "ticketSummary" TEXT NOT NULL,
    "ticketDescription" TEXT NOT NULL,
    "ticketStatus" TEXT,
    "ticketType" TEXT,
    "model" TEXT NOT NULL,
    "pipelineType" TEXT NOT NULL DEFAULT 'legacy',
    "analysisJson" TEXT,
    "draftComment" TEXT NOT NULL,
    "estimatedComplexity" TEXT,
    "enrichedRequestJson" TEXT,
    "retrievalContextJson" TEXT,
    "groundedResponseJson" TEXT,
    "confidence" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentPosted" BOOLEAN NOT NULL DEFAULT false,
    "commentPostedAt" DATETIME,
    "jiraCommentId" TEXT
);
INSERT INTO "new_Analysis" ("analysisJson", "commentPosted", "commentPostedAt", "createdAt", "draftComment", "estimatedComplexity", "id", "jiraCommentId", "model", "ticketDescription", "ticketKey", "ticketStatus", "ticketSummary", "ticketType", "ticketUrl") SELECT "analysisJson", "commentPosted", "commentPostedAt", "createdAt", "draftComment", "estimatedComplexity", "id", "jiraCommentId", "model", "ticketDescription", "ticketKey", "ticketStatus", "ticketSummary", "ticketType", "ticketUrl" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
CREATE INDEX "Analysis_ticketKey_idx" ON "Analysis"("ticketKey");
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
