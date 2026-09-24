-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "autoDedupeKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_autoDedupeKey_key" ON "Analysis"("autoDedupeKey");
