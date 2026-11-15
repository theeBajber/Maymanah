import type { JoinState } from "@/lib/live-session";

export interface SessionRow {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  sessionType: string;
  isTeacher: boolean;
  otherPartyName: string;
  planLabel: string | null;
  joinState: JoinState;
  opensAt: string;
  closesAt: string;
}

export interface ProgressSummary {
  rangeCount: number;
  uniqueAyahs: number;
  percent: number;
  lastStop: { surah: number; ayah: number; surahName: string } | null;
}

export interface PendingReportRow {
  id: string;
  title: string | null;
  startTime: string;
  sessionType: string;
  studentName: string;
}
