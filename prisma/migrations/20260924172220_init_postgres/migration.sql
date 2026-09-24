-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "ticketKey" TEXT NOT NULL,
    "ticketUrl" TEXT NOT NULL,
    "ticketSummary" TEXT NOT NULL,
    "ticketDescription" TEXT NOT NULL,
    "ticketStatus" TEXT,
    "ticketType" TEXT,
    "model" TEXT NOT NULL,
    "pipelineType" TEXT NOT NULL DEFAULT 'legacy',
    "triggerSource" TEXT NOT NULL DEFAULT 'manual',
    "analysisJson" TEXT,
    "draftComment" TEXT NOT NULL,
    "estimatedComplexity" TEXT,
    "enrichedRequestJson" TEXT,
    "retrievalContextJson" TEXT,
    "groundedResponseJson" TEXT,
    "confidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "commentPosted" BOOLEAN NOT NULL DEFAULT false,
    "commentPostedAt" TIMESTAMP(3),
    "jiraCommentId" TEXT,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "updatedAt" TIMESTAMP(3),
    "contentHash" TEXT NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "section" TEXT,
    "text" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "embedding" TEXT NOT NULL,
    "embeddingModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analysis_ticketKey_idx" ON "Analysis"("ticketKey");

-- CreateIndex
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeDocument_source_sourceId_key" ON "KnowledgeDocument"("source", "sourceId");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_documentId_idx" ON "KnowledgeChunk"("documentId");

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
