-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MentorshipStatus" ADD VALUE 'RESERVED';
ALTER TYPE "MentorshipStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "UstadhProfile" ADD COLUMN     "maxStudents" INTEGER NOT NULL DEFAULT 4;

-- AlterTable
ALTER TABLE "Mentorship" ADD COLUMN     "endReason" TEXT,
ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "reservedUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "requiresMentor" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Mentorship_status_idx" ON "Mentorship"("status");

-- CreateIndex
CREATE INDEX "Mentorship_reservedUntil_idx" ON "Mentorship"("reservedUntil");

-- CreateIndex
CREATE INDEX "Mentorship_pausedAt_idx" ON "Mentorship"("pausedAt");


-- A paused pairing that predates the timestamp holds its seat until the grace
-- period measured from this migration, rather than being released at once.
UPDATE "Mentorship" SET "pausedAt" = NOW() WHERE "status" = 'PAUSED' AND "pausedAt" IS NULL;

-- The memorisation course is taught one-to-one, so its enrolments take a seat.
UPDATE "Course" SET "requiresMentor" = true WHERE "slug" = 'hifdh-ul-quran';
