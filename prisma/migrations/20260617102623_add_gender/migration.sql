-- CreateEnum
CREATE TYPE "NotePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- DropIndex
DROP INDEX "Donation_donorId_idx";

-- DropIndex
DROP INDEX "Donation_status_idx";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "surahNumber" INTEGER,
ADD COLUMN     "verseNumber" INTEGER;

-- DropEnum
DROP TYPE "PaymentStatus";

-- CreateTable
CREATE TABLE "UstadhProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "reliabilityScore" DOUBLE PRECISION,
    "bio" TEXT,
    "qualifications" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UstadhProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentNote" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "ustadhId" TEXT NOT NULL,
    "sessionId" TEXT,
    "content" TEXT NOT NULL,
    "priority" "NotePriority" NOT NULL DEFAULT 'MEDIUM',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuranProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastSurah" INTEGER NOT NULL DEFAULT 1,
    "lastVerse" INTEGER NOT NULL DEFAULT 1,
    "lastRecitation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuranProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecitationJournal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "fromVerse" INTEGER NOT NULL,
    "toVerse" INTEGER NOT NULL,
    "errors" JSONB,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecitationJournal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UstadhProfile_userId_key" ON "UstadhProfile"("userId");

-- CreateIndex
CREATE INDEX "UstadhProfile_userId_idx" ON "UstadhProfile"("userId");

-- CreateIndex
CREATE INDEX "UstadhProfile_isApproved_idx" ON "UstadhProfile"("isApproved");

-- CreateIndex
CREATE INDEX "StudentNote_studentId_idx" ON "StudentNote"("studentId");

-- CreateIndex
CREATE INDEX "StudentNote_ustadhId_idx" ON "StudentNote"("ustadhId");

-- CreateIndex
CREATE INDEX "StudentNote_resolved_idx" ON "StudentNote"("resolved");

-- CreateIndex
CREATE INDEX "StudentNote_sessionId_idx" ON "StudentNote"("sessionId");

-- CreateIndex
CREATE INDEX "QuranProgress_userId_idx" ON "QuranProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "QuranProgress_userId_key" ON "QuranProgress"("userId");

-- CreateIndex
CREATE INDEX "RecitationJournal_userId_idx" ON "RecitationJournal"("userId");

-- CreateIndex
CREATE INDEX "RecitationJournal_createdAt_idx" ON "RecitationJournal"("createdAt");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "UstadhProfile" ADD CONSTRAINT "UstadhProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_ustadhId_fkey" FOREIGN KEY ("ustadhId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuranProgress" ADD CONSTRAINT "QuranProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecitationJournal" ADD CONSTRAINT "RecitationJournal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
