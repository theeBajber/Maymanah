"use client";

import {
  BookOpen,
  CircleAlert,
  Compass,
  History,
  NotebookPen,
} from "lucide-react";

import { amiri } from "@/app/ui/fonts";
import { LocalTime } from "@/app/ui/LocalTime";
import { StatusChip, type StatusTone } from "@/app/ui/chips";
import { Panel } from "@/app/ui/portal";
import {
  checkRange,
  planRangeLabel,
  sessionTypeLabel,
  type PlanRange,
  type SurahLike,
} from "@/lib/live-session";
import type { Attendance, SessionSummary, TeacherContext, SurahOption } from "./types";

const ATTENDANCE_LABEL: Record<Attendance, string> = {
  PRESENT: "Present",
  LATE: "Late",
  ABSENT: "Absent",
  EXCUSED: "Excused",
};

const PRIORITY: Record<string, { label: string; tone: StatusTone }> = {
  HIGH: { label: "High priority", tone: "danger" },
  MEDIUM: { label: "Worth noting", tone: "warning" },
  LOW: { label: "Low priority", tone: "neutral" },
};

function toPlanRange(range: TeacherContext["manzil"]): PlanRange | null {
  if (!range) return null;
  return {
    fromSurah: range.fromSurah,
    fromVerse: range.fromAyah,
    toSurah: range.toSurah,
    toVerse: range.toAyah,
  };
}

/**
 * The teacher's preparation panel.
 *
 * Sabaq, Sabqi, and Manzil are suggestions assembled from records that already
 * exist, never a saved assignment. Each one says where it came from so the
 * teacher can judge it instead of trusting it blindly.
 */
export function BeforeLesson({
  session,
  plan,
  context,
  surahs,
}: {
  session: SessionSummary;
  plan: PlanRange | null;
  context: TeacherContext;
  surahs: SurahOption[];
}) {
  const manzil = toPlanRange(context.manzil);
  const manzilCheck = manzil
    ? checkRange(
        {
          fromSurah: manzil.fromSurah,
          fromAyah: manzil.fromVerse,
          toSurah: manzil.toSurah,
          toAyah: manzil.toVerse,
        },
        surahs as SurahLike[],
      )
    : null;
  const note = context.lastNote;
  const notePriority = note ? PRIORITY[note.priority] ?? PRIORITY.LOW : null;

  return (
    <Panel className="flex flex-col gap-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            Before lesson
          </p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">
            Preparing for {session.otherPartyName ?? "your student"}
          </h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            {sessionTypeLabel(session.sessionType)} ·{" "}
            <LocalTime iso={session.startTime} mode="weekday-time" />
          </p>
        </div>
        <StatusChip tone="info">Suggested, not assigned</StatusChip>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Suggestion
          icon={BookOpen}
          label="Sabaq"
          source="From today's plan"
          value={plan ? planRangeLabel(plan, surahs as SurahLike[]) : null}
          empty="No plan yet. Set one below."
        />
        <Suggestion
          icon={History}
          label="Sabqi"
          source="From the last report"
          value={
            context.lastReport?.range
              ? planRangeLabel(context.lastReport.range, surahs as SurahLike[])
              : null
          }
          empty="No earlier range recorded."
        />
        <Suggestion
          icon={Compass}
          label="Manzil"
          source="Estimated from progress"
          value={
            manzil
              ? `${planRangeLabel(manzil, surahs as SurahLike[])}${
                  manzilCheck?.valid
                    ? ` · ${manzilCheck.ayahs.toLocaleString("en-US")} ayahs`
                    : ""
                }`
              : null
          }
          empty="Progress appears after the first report."
          hint={context.lastStop?.arabicName ? (
            <span dir="rtl" lang="ar" className={`${amiri.className} text-base leading-loose`}>
              {context.lastStop.arabicName}
            </span>
          ) : null}
        />
      </div>

      <div className="grid gap-4 border-t border-border pt-4 md:grid-cols-2">
        <section className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            Where they are
          </h3>
          {context.progress.uniqueAyahs > 0 ? (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-2xl font-bold tabular-nums text-text-primary">
                  {context.progress.percent}%
                </p>
                <p className="text-xs tabular-nums text-text-secondary">
                  {context.progress.uniqueAyahs.toLocaleString("en-US")} ayahs ·{" "}
                  {context.progress.rangeCount}{" "}
                  {context.progress.rangeCount === 1 ? "range" : "ranges"}
                </p>
              </div>
              <div
                role="progressbar"
                aria-label="Quran memorised"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={context.progress.percent}
                className="h-1.5 overflow-hidden rounded-full bg-bg-hover"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${context.progress.percent}%` }}
                />
              </div>
              <p className="text-xs text-text-secondary">
                {context.lastStop ? (
                  <>
                    Last stop:{" "}
                    <span className="font-semibold text-text-primary">
                      {context.lastStop.surahName} {context.lastStop.surah}:{context.lastStop.ayah}
                    </span>
                  </>
                ) : null}
              </p>
            </>
          ) : (
            <p className="text-sm text-text-secondary">
              Nothing recorded yet. The first report will set the starting point.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            Last lesson
          </h3>
          {context.lastReport ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip
                  tone={
                    context.lastReport.attendance === "PRESENT"
                      ? "success"
                      : context.lastReport.attendance === "LATE"
                        ? "warning"
                        : context.lastReport.attendance === "ABSENT"
                          ? "danger"
                          : "neutral"
                  }
                >
                  {ATTENDANCE_LABEL[context.lastReport.attendance]}
                </StatusChip>
                {context.lastReport.rating ? (
                  <span className="text-xs font-semibold text-text-secondary">
                    Rated {context.lastReport.rating}/5
                  </span>
                ) : null}
                <span className="text-xs text-text-secondary">
                  <LocalTime iso={context.lastReport.submittedAt} mode="date-short" />
                </span>
              </div>
              {context.lastReport.range ? (
                <p className="text-sm text-text-primary">
                  {planRangeLabel(context.lastReport.range, surahs as SurahLike[])}
                </p>
              ) : null}
              {context.lastReport.notes ? (
                <p className="line-clamp-3 whitespace-pre-line text-xs leading-relaxed text-text-secondary">
                  {context.lastReport.notes}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-text-secondary">No previous report for this pairing yet.</p>
          )}
        </section>
      </div>

      {note ? (
        <section className="flex gap-3 rounded-xl border border-border bg-bg-primary p-4">
          <NotebookPen aria-hidden className="mt-0.5 size-4 shrink-0 text-text-secondary" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                Open note
              </h3>
              {notePriority ? (
                <StatusChip tone={notePriority.tone}>{notePriority.label}</StatusChip>
              ) : null}
            </div>
            <p className="whitespace-pre-line text-sm text-text-primary">{note.content}</p>
            <p className="text-xs text-text-secondary">
              Added <LocalTime iso={note.createdAt} mode="date-short" />
            </p>
          </div>
        </section>
      ) : null}

      {context.nextPlan || context.nextSessionAt ? (
        <section className="flex flex-wrap items-start gap-3 border-t border-border pt-4">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-info" />
          <div className="min-w-0">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
              Next lesson
            </h3>
            <p className="mt-1 text-sm text-text-primary">
              {context.nextPlan
                ? planRangeLabel(context.nextPlan, surahs as SurahLike[])
                : "No plan set yet"}
              {context.nextSessionAt ? (
                <>
                  {" · "}
                  <LocalTime iso={context.nextSessionAt} mode="weekday-time" />
                </>
              ) : null}
            </p>
          </div>
        </section>
      ) : null}
    </Panel>
  );
}

function Suggestion({
  icon: Icon,
  label,
  source,
  value,
  empty,
  hint,
}: {
  icon: typeof BookOpen;
  label: string;
  source: string;
  value: string | null;
  empty: string;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2">
        <Icon aria-hidden className="size-3.5 shrink-0 text-text-secondary" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          {label}
        </p>
      </div>
      <p className="text-sm font-semibold text-text-primary">
        {value ?? <span className="font-normal text-text-secondary">{empty}</span>}
      </p>
      <p className="text-[11px] text-text-secondary">{source}</p>
      {hint ? <div className="mt-1">{hint}</div> : null}
    </div>
  );
}
