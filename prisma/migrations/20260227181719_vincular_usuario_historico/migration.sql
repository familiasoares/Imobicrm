-- AlterTable
ALTER TABLE "lead_history" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "lead_history_userId_idx" ON "lead_history"("userId");

-- AddForeignKey
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
