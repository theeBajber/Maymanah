"use client";

import { BookOpen, ClipboardList, Star } from "lucide-react";

import { amiri } from "@/app/ui/fonts";
import { LocalTime } from "@/app/ui/LocalTime";
import { StatusChip } from "@/app/ui/chips";
import { EmptyState, Panel } from "@/app/ui/portal";
import { planRangeLabel, type SurahLike } from "@/lib/live-session";
import { surahArabicName } from "@/lib/surah-arabic";
import type { Attendance, LessonReport, SessionPlan, SurahOption } from "./types";

const ATTENDANCE_LABEL: Record<Attendance, string> = {
  PRESENT: "Present",
  LATE: "Late",
  ABSENT: "Absent",
  EXCUSED: "Excused",
};

const ATTENDANCE_TONE = {
  PRESENT: "success",
  LATE: "warning",
  ABSENT: "danger",
  EXCUSED: "neutral",
} as const;

const RATING_WORDS: Record<number, string> = {
  1: "Needs work",
  2: "Developing",
  3: "Steady",
  4: "Strong",
  5: "Excellent",
};

function ArabicSurah({ number }: { number: number }) {
  const name = surahArabicName(number);
  if (!name) return null;

  return (
    <span
      dir="rtl"
      lang="ar"
      className={`${amiri.className} text-lg leading-loose text-text-secondary`}
    >
      {name}
    </span>
  );
}

/** What the lesson is meant to cover, as the student sees it. */
export function LessonBrief({
  plan,
  surahs,
  isTeacher,
  ended = false,
}: {
  plan: SessionPlan | null;
  surahs: SurahOption[];
  isTeacher: boolean;
  /** A finished lesson talks about the plan in the past tense. */
  ended?: boolean;
}) {
  if (!plan) {
    return (
      <Panel className="flex flex-col gap-3 p-5">
        <SectionLabel icon={BookOpen}>
          {ended ? "What we planned to cover" : "What we'll cover"}
        </SectionLabel>
        <p className="text-sm text-text-secondary">
          {isTeacher
            ? "No plan yet. Add one so your student knows what to prepare."
            : "Your teacher has not set a plan for this lesson yet."}
        </p>
      </Panel>
    );
  }

  return (
    <Panel className="flex flex-col gap-3 p-5">
      <SectionLabel icon={BookOpen}>
        {ended ? "What we planned to cover" : "What we'll cover"}
      </SectionLabel>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-lg font-semibold text-text-primary">
          {planRangeLabel(plan, surahs as SurahLike[])}
        </p>
        <div className="flex items-baseline gap-2">
          <ArabicSurah number={plan.fromSurah} />
          {plan.toSurah !== plan.fromSurah ? <ArabicSurah number={plan.toSurah} /> : null}
        </div>
      </div>
      <p className="text-xs text-text-secondary">
        {isTeacher
          ? "This is what the lesson was planned to cover. The report above starts from this range."
          : ended
            ? "This was the plan for the lesson. Your teacher's report below says how it went."
            : "Your teacher sets this before the lesson. Prepare this range beforehand."}
      </p>
    </Panel>
  );
}

/** The report as the student sees it once the lesson is closed. */
export function ReportCard({
  report,
  surahs,
}: {
  report: LessonReport;
  surahs: SurahOption[];
}) {
  const range =
    report.fromSurah !== null &&
    report.fromVerse !== null &&
    report.toSurah !== null &&
    report.toVerse !== null
      ? {
          fromSurah: report.fromSurah,
          fromVerse: report.fromVerse,
          toSurah: report.toSurah,
          toVerse: report.toVerse,
        }
      : null;

  return (
    <Panel className="flex flex-col gap-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionLabel icon={ClipboardList}>Lesson report</SectionLabel>
          <p className="mt-1 text-sm text-text-secondary">
            From {report.submittedBy.name} ·{" "}
            <LocalTime iso={report.submittedAt} mode="date-short" />
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone={ATTENDANCE_TONE[report.attendance]}>
            {ATTENDANCE_LABEL[report.attendance]}
          </StatusChip>
          {report.rating ? (
            <StatusChip tone="primary">
              <Star aria-hidden className="size-3" />
              {report.rating}/5 · {RATING_WORDS[report.rating] ?? "Rated"}
            </StatusChip>
          ) : null}
        </div>
      </div>

      {range ? (
        <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-border bg-bg-primary p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
              New memorisation
            </p>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              {planRangeLabel(range, surahs as SurahLike[])}
            </p>
          </div>
          <ArabicSurah number={range.fromSurah} />
        </div>
      ) : null}

      {report.revision ? (
        <ReportText label="Revision covered">{report.revision}</ReportText>
      ) : null}

      {report.notes ? <ReportText label="Notes for you">{report.notes}</ReportText> : null}

      {report.nextAssignment ? (
        <div className="rounded-xl border border-primary/25 bg-primary-muted p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            Next assignment
          </p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-text-primary">
            {report.nextAssignment}
          </p>
        </div>
      ) : null}
    </Panel>
  );
}

export function PendingReport() {
  return (
    <EmptyState
      title="Your teacher is still writing the report for this lesson."
      action={
        <p className="mt-2 text-sm text-text-secondary">
          It will appear here, with any notes and your next assignment, as soon as it is ready.
        </p>
      }
    />
  );
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: typeof BookOpen;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
      <Icon aria-hidden className="size-3.5" />
      {children}
    </p>
  );
}

function ReportText({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-text-primary">
        {children}
      </p>
    </div>
  );
}
