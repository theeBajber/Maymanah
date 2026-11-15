"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { LocalTime } from "@/app/ui/LocalTime";
import { ChipGroup, StatusChip } from "@/app/ui/chips";
import { Panel } from "@/app/ui/portal";
import { useToast } from "@/app/ui/toast";
import {
  planRangeLabel,
  rangeHint,
  revisionPhraseExists,
  suggestedNextAssignment,
  toggleRevisionPhrase,
  type SurahLike,
} from "@/lib/live-session";
import { RangeFields, type RangeValue } from "./RangeFields";
import type {
  Attendance,
  LessonReport,
  SessionPlan,
  SurahOption,
  TeacherContext,
} from "./types";

const ATTENDANCE_OPTIONS: { value: Attendance; label: string }[] = [
  { value: "PRESENT", label: "Present" },
  { value: "LATE", label: "Late" },
  { value: "ABSENT", label: "Absent" },
  { value: "EXCUSED", label: "Excused" },
];

const RATING_WORDS: Record<number, string> = {
  1: "Needs work",
  2: "Developing",
  3: "Steady",
  4: "Strong",
  5: "Excellent",
};

const RATING_OPTIONS = [
  { value: "", label: "No rating" },
  ...[1, 2, 3, 4, 5].map((value) => ({
    value: String(value),
    label: String(value),
    description: `${value} out of 5, ${RATING_WORDS[value].toLowerCase()}`,
  })),
];

const FIELD =
  "w-full rounded-[10px] border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary transition-colors focus-visible:border-primary disabled:opacity-60";

function rangeValueOf(plan: SessionPlan | null): RangeValue {
  return {
    fromSurah: plan?.fromSurah ?? 1,
    fromAyah: plan?.fromVerse ?? 1,
    toSurah: plan?.toSurah ?? 1,
    toAyah: plan?.toVerse ?? 7,
  };
}

/**
 * The teacher's post-lesson report.
 *
 * Validation mirrors the server so Save can be honest about whether the range
 * is usable; the report route still validates and writes. The form owns its
 * dirty state so the page can warn before discarding typed notes.
 */
export function ReportForm({
  appointmentId,
  report,
  plan,
  context,
  surahs,
  studentName,
  onSaved,
  onDirtyChange,
}: {
  appointmentId: string;
  report: LessonReport | null;
  plan: SessionPlan | null;
  context: TeacherContext;
  surahs: SurahOption[];
  studentName: string;
  onSaved: (report: LessonReport) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { toast } = useToast();
  const hintId = useId();

  const suggestion = suggestedNextAssignment({
    nextPlan: context.nextPlan,
    lastStop: context.lastStop
      ? { surah: context.lastStop.surah, ayah: context.lastStop.ayah }
      : null,
    surahs,
  });

  const [attendance, setAttendance] = useState<Attendance>(report?.attendance ?? "PRESENT");
  const [hasRange, setHasRange] = useState(
    report ? report.fromSurah != null : Boolean(plan),
  );
  const [range, setRange] = useState<RangeValue>(rangeValueOf(plan));
  const [rating, setRating] = useState(report?.rating ? String(report.rating) : "");
  const [revision, setRevision] = useState(report?.revision ?? "");
  const [notes, setNotes] = useState(report?.notes ?? "");
  const [nextAssignment, setNextAssignment] = useState(report?.nextAssignment ?? suggestion);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const inFlight = useRef(false);
  const absent = attendance === "ABSENT" || attendance === "EXCUSED";
  const showRange = hasRange && !absent;

  const snapshot = JSON.stringify({
    attendance,
    hasRange,
    range,
    rating,
    revision,
    notes,
    nextAssignment,
  });
  const [baseline, setBaseline] = useState(snapshot);
  const dirty = snapshot !== baseline;
  const rangeView = showRange ? rangeHint(range, surahs as SurahLike[]) : null;
  const invalid = Boolean(rangeView && !rangeView.valid);

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    if (!dirty) return;

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const revisionChips = [
    plan
      ? { label: "Sabaq", phrase: `Sabaq: ${planRangeLabel(plan, surahs as SurahLike[])}` }
      : null,
    context.lastReport?.range
      ? {
          label: "Sabqi",
          phrase: `Sabqi: ${planRangeLabel(context.lastReport.range, surahs as SurahLike[])}`,
        }
      : null,
    context.lastStop
      ? {
          label: "Manzil",
          phrase: `Manzil: ${context.lastStop.surahName} ${context.lastStop.surah}:${context.lastStop.ayah}`,
        }
      : null,
  ]
    .filter((chip): chip is { label: string; phrase: string } => chip !== null)
    .filter((chip, index, all) => all.findIndex((row) => row.phrase === chip.phrase) === index);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current || invalid) return;

    inFlight.current = true;
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/report`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          attendance,
          range: showRange ? range : null,
          rating: rating ? Number(rating) : null,
          revision: revision.trim() || null,
          notes: notes.trim() || null,
          nextAssignment: nextAssignment.trim() || null,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        report?: LessonReport;
        error?: string;
      };

      if (!response.ok || !body.report) {
        toast({ title: body.error ?? "Could not save the report", variant: "error" });
        return;
      }

      onSaved(body.report);
      setBaseline(snapshot);
      setSaved(true);
      toast({ title: "Lesson report saved", variant: "success" });
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <Panel className="flex flex-col gap-5 p-5" id="report">
      <form onSubmit={save} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
              Lesson report
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Recorded after the lesson. It moves {studentName}&apos;s position forward when the
              range is new.
            </p>
          </div>
          {report ? (
            <StatusChip tone="success">
              Submitted <LocalTime iso={report.submittedAt} mode="date-short" />
            </StatusChip>
          ) : (
            <StatusChip tone="warning">Pending</StatusChip>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-text-primary">Attendance</p>
          <ChipGroup
            label="Attendance"
            options={ATTENDANCE_OPTIONS}
            value={attendance}
            onChange={(value) => {
              setAttendance(value);
              if (value === "ABSENT" || value === "EXCUSED") setHasRange(false);
            }}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <label htmlFor="record-range" className="flex items-start gap-3 text-sm text-text-primary">
            <input
              id="record-range"
              type="checkbox"
              checked={hasRange && !absent}
              disabled={absent}
              onChange={(event) => setHasRange(event.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-primary"
            />
            <span>
              <span className="font-semibold">Record new memorisation</span>
              <span className="mt-0.5 block text-xs text-text-secondary">
                {absent
                  ? "A lesson the student missed cannot add new memorisation."
                  : "Leave this off when the lesson was revision only."}
              </span>
            </span>
          </label>

          {showRange ? (
            <>
              <RangeFields
                surahs={surahs}
                value={range}
                onChange={setRange}
                invalid={invalid}
                describedBy={hintId}
              />
              {rangeView ? (
                <p
                  id={hintId}
                  aria-live="polite"
                  className={`text-xs font-medium ${
                    rangeView.valid ? "text-text-secondary" : "text-danger"
                  }`}
                >
                  {rangeView.message}
                </p>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="revision" className="text-sm font-semibold text-text-primary">
            Revision covered
          </label>
          {revisionChips.length > 0 ? (
            <div
              role="group"
              aria-label="Add a revision phrase"
              className="flex flex-wrap gap-2"
            >
              {revisionChips.map((chip) => {
                const active = revisionPhraseExists(revision, chip.phrase);
                return (
                  <button
                    key={chip.phrase}
                    type="button"
                    aria-pressed={active}
                    aria-label={`${chip.label}: ${chip.phrase}`}
                    onClick={() =>
                      setRevision((current) => toggleRevisionPhrase(current, chip.phrase))
                    }
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors ${
                      active
                        ? "border-primary bg-primary text-text-inverse"
                        : "border-border bg-bg-elevated text-text-primary hover:bg-bg-hover"
                    }`}
                  >
                    {active ? <Check aria-hidden className="size-3.5" /> : null}
                    {chip.label}
                  </button>
                );
              })}
            </div>
          ) : null}
          <textarea
            id="revision"
            value={revision}
            onChange={(event) => setRevision(event.target.value)}
            rows={2}
            maxLength={2000}
            className={FIELD}
            placeholder="What was revised today"
          />
          <p className="text-xs text-text-secondary">
            Chips add a readable phrase. You can still type anything else.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-text-primary">How did the student do?</p>
          <ChipGroup
            label="Rating, optional"
            options={RATING_OPTIONS}
            value={rating}
            onChange={setRating}
          />
          <p className="text-xs text-text-secondary">
            {rating
              ? `${rating} / 5 · ${RATING_WORDS[Number(rating)]}`
              : "Optional — leave it blank if you would rather not rate."}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-semibold text-text-primary">
            Notes for the student
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            maxLength={4000}
            className={FIELD}
            placeholder="Strengths, corrections, and what to watch"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="next-assignment" className="text-sm font-semibold text-text-primary">
            Next assignment
          </label>
          <textarea
            id="next-assignment"
            value={nextAssignment}
            onChange={(event) => setNextAssignment(event.target.value)}
            rows={3}
            maxLength={1000}
            className={FIELD}
            placeholder="What to prepare before the next session"
          />
          <p className="text-xs text-text-secondary">
            {context.nextPlan
              ? "Suggested from the next lesson's plan. Edit as needed."
              : context.lastStop
                ? "Suggested from the student's current position. Edit as needed."
                : "Optional."}
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving || invalid}
              className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
              {saving ? "Saving…" : report ? "Update report" : "Save report"}
            </button>
            <p className="text-xs text-text-secondary">
              Saving updates {studentName}&apos;s memorisation position and progress.
            </p>
          </div>

          {saved && !dirty ? (
            <p
              role="status"
              className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-muted px-3 py-2 text-sm text-text-primary"
            >
              <Check aria-hidden className="size-4 text-success" />
              Report saved. {studentName}&apos;s position is up to date.
            </p>
          ) : null}

          {dirty ? (
            <p className="text-xs text-text-secondary">
              You have unsaved changes. Leaving this page will discard them.
            </p>
          ) : null}
        </div>
      </form>
    </Panel>
  );
}
