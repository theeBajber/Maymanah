-- CreateEnum
CREATE TYPE "MentorshipStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AppointmentSessionType" AS ENUM ('DAILY_HIFDH', 'MURAJA', 'EXTRA');

-- CreateTable
CREATE TABLE "Mentorship" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "MentorshipStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Mentorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "meetingUrl" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "sessionType" "AppointmentSessionType" NOT NULL DEFAULT 'DAILY_HIFDH',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3),
    "missed" BOOLEAN NOT NULL DEFAULT false,
    "surahNumber" INTEGER,
    "verseNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringSlot" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "type" "AppointmentSessionType" NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionPlan" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "fromSurah" INTEGER NOT NULL,
    "fromVerse" INTEGER NOT NULL,
    "toSurah" INTEGER NOT NULL,
    "toVerse" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mentorship_teacherId_idx" ON "Mentorship"("teacherId");

-- CreateIndex
CREATE INDEX "Mentorship_studentId_idx" ON "Mentorship"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Mentorship_teacherId_studentId_key" ON "Mentorship"("teacherId", "studentId");

-- CreateIndex
CREATE INDEX "Appointment_mentorshipId_idx" ON "Appointment"("mentorshipId");

-- CreateIndex
CREATE INDEX "Appointment_teacherId_idx" ON "Appointment"("teacherId");

-- CreateIndex
CREATE INDEX "Appointment_startTime_idx" ON "Appointment"("startTime");

-- CreateIndex
CREATE INDEX "RecurringSlot_mentorshipId_idx" ON "RecurringSlot"("mentorshipId");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringSlot_mentorshipId_type_dayOfWeek_key" ON "RecurringSlot"("mentorshipId", "type", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "SessionPlan_appointmentId_key" ON "SessionPlan"("appointmentId");

-- CreateIndex
CREATE INDEX "SessionPlan_appointmentId_idx" ON "SessionPlan"("appointmentId");

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringSlot" ADD CONSTRAINT "RecurringSlot_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionPlan" ADD CONSTRAINT "SessionPlan_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

