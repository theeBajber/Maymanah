-- CreateEnum
CREATE TYPE "AccountStanding" AS ENUM ('GOOD', 'WARNED', 'PAUSED', 'DISABLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "standing" "AccountStanding" NOT NULL DEFAULT 'GOOD',
ADD COLUMN     "standingReason" TEXT,
ADD COLUMN     "standingUpdatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AccountStandingEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "standing" "AccountStanding" NOT NULL,
    "previousStanding" "AccountStanding" NOT NULL,
    "reason" TEXT NOT NULL,
    "absenceCount" INTEGER,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "mode" TEXT NOT NULL DEFAULT 'automatic',
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountStandingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountStandingEvent_userId_createdAt_idx" ON "AccountStandingEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AccountStandingEvent_standing_applied_idx" ON "AccountStandingEvent"("standing", "applied");

-- CreateIndex
CREATE INDEX "User_standing_idx" ON "User"("standing");

-- AddForeignKey
ALTER TABLE "AccountStandingEvent" ADD CONSTRAINT "AccountStandingEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

