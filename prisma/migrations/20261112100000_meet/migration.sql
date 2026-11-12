-- CreateEnum
CREATE TYPE "MeetingPreference" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "MeetingProvider" AS ENUM ('MANUAL', 'GOOGLE_MEET');

-- CreateEnum
CREATE TYPE "MeetingConnectionStatus" AS ENUM ('CONNECTED', 'REAUTH_REQUIRED');

-- AlterTable
ALTER TABLE "UstadhProfile" ADD COLUMN     "meetingPreference" "MeetingPreference" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "generatedMeetingUrl" TEXT,
ADD COLUMN     "meetingCreatedAt" TIMESTAMP(3),
ADD COLUMN     "meetingEventId" TEXT,
ADD COLUMN     "meetingProvider" "MeetingProvider";

-- CreateTable
CREATE TABLE "MeetingAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'google',
    "refreshToken" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "calendarName" TEXT NOT NULL DEFAULT 'Maymanah Lessons',
    "status" "MeetingConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "lastError" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingAccount_userId_key" ON "MeetingAccount"("userId");

-- CreateIndex
CREATE INDEX "MeetingAccount_status_idx" ON "MeetingAccount"("status");

-- AddForeignKey
ALTER TABLE "MeetingAccount" ADD CONSTRAINT "MeetingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

