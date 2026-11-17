import type { JoinState } from "@/lib/live-session";
import type { SurahOption } from "./RangeFields";

export type Attendance = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export interface SessionPlan {
  fromSurah: number;
  fromVerse: number;
  toSurah: number;
  toVerse: number;
}

export interface LessonReport {
  id: string;
  attendance: Attendance;
  fromSurah: number | null;
  fromVerse: number | null;
  toSurah: number | null;
  toVerse: number | null;
  revision: string | null;
  rating: number | null;
  notes: string | null;
  nextAssignment: string | null;
  submittedAt: string;
  submittedBy: { id: string; name: string };
}

export interface SessionSummary {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  sessionType: string;
  isTeacher: boolean;
  studentId: string;
  otherPartyName: string | null;
  joinState: JoinState;
  opensAt: string;
  closesAt: string;
}

export interface TeacherContext {
  lastStop: {
    surah: number;
    ayah: number;
    surahName: string;
    arabicName: string | null;
  } | null;
  progress: {
    uniqueAyahs: number;
    percent: number;
    rangeCount: number;
  };
  lastReport: {
    attendance: Attendance;
    rating: number | null;
    notes: string | null;
    revision: string | null;
    range: SessionPlan | null;
    submittedAt: string;
  } | null;
  lastNote: {
    content: string;
    priority: string;
    createdAt: string;
  } | null;
  manzil: {
    fromSurah: number;
    fromAyah: number;
    toSurah: number;
    toAyah: number;
  } | null;
  nextPlan: SessionPlan | null;
  nextSessionAt: string | null;
}

export interface MeetingSettings {
  configured: boolean;
  preference: "AUTO" | "MANUAL";
  connected: boolean;
  status: "CONNECTED" | "REAUTH_REQUIRED" | null;
  calendarName: string | null;
  /** The teacher's standing room address, or null when none is saved. */
  defaultUrl: string | null;
}

export interface SummaryPayload {
  appointment: SessionSummary;
  plan: SessionPlan | null;
  report: LessonReport | null;
  teacherContext: TeacherContext | null;
}

export type { SurahOption };
