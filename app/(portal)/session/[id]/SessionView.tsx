"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { VideoRoom } from "@/app/ui/VideoRoom";
import { GlassCard } from "@/app/ui/glass";
import { useToast } from "@/app/ui/toast";
import { rangeLabel } from "@/lib/quran-meta";
import { RangeFields, type RangeValue, type SurahOption } from "./RangeFields";
import { SessionNotes } from "./SessionNotes";

interface SessionPlan {
  fromSurah: number;
  fromVerse: number;
  toSurah: number;
  toVerse: number;
}

type Attendance = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

interface LessonReport {
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

interface SessionSummary {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  sessionType: string;
  isTeacher: boolean;
  studentId: string;
  otherPartyName: string | null;
  canJoin: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
}

interface SummaryPayload {
  appointment: SessionSummary;
  plan: SessionPlan | null;
  report: LessonReport | null;
}

interface JoinPayload {
  token: string;
  roomName: string;
  liveKitUrl: string;
}

const ATTENDANCE_LABELS: Record<Attendance, string> = {
  PRESENT: "Present",
  LATE: "Late",
  ABSENT: "Absent",
  EXCUSED: "Excused",
};

/**
 * A session, before and after the call.
 *
 * The summary loads first so the plan and the report are visible without
 * entering a call — a teacher can set what the session covers, and submit the
 * report afterwards, while the student can read it long after joining closes.
 */
export function SessionView({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<SummaryPayload | null>(null);
  const [surahs, setSurahs] = useState<SurahOption[] | null>(null);
  const [error, setError] = useState("");
  const [call, setCall] = useState<JoinPayload | null>(null);
  const [inCall, setInCall] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [summaryResponse, surahResponse] = await Promise.all([
          fetch(`/api/appointments/${appointmentId}/summary`),
          fetch("/api/quran/surahs"),
        ]);
        const summaryBody = (await summaryResponse.json().catch(() => ({}))) as SummaryPayload & {
          error?: string;
        };
        const surahBody = (await surahResponse.json().catch(() => ({}))) as {
          surahs?: SurahOption[];
          error?: string;
        };

        if (cancelled) return;
        if (!summaryResponse.ok) {
          setError(summaryBody.error ?? "Could not load that session.");
          return;
        }
        if (!surahResponse.ok || !surahBody.surahs) {
          setError(surahBody.error ?? "Could not load the surah list.");
          return;
        }

        setData(summaryBody);
        setSurahs(surahBody.surahs);
      } catch {
        if (!cancelled) setError("Could not reach the server.");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  const leave = useCallback(() => {
    setInCall(false);
    setCall(null);
    setJoinError("");
    router.refresh();
  }, [router]);

  async function startCall() {
    setJoining(true);
    setJoinError("");
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/join`);
      const body = (await response.json().catch(() => ({}))) as Partial<JoinPayload> & { error?: string };
      if (!response.ok || !body.token || !body.liveKitUrl) {
        setJoinError(body.error ?? "Could not join that session.");
        return;
      }
      setCall(body as JoinPayload);
      setInCall(true);
    } catch {
      setJoinError("Could not reach the server.");
    } finally {
      setJoining(false);
    }
  }

  if (error) {
    return (
      <GlassCard className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <h1 className="text-xl font-bold text-text-primary">Cannot open this session</h1>
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex h-11 items-center rounded-[10px] bg-accent px-6 text-sm font-semibold text-text-inverse transition-all hover:brightness-95"
        >
          Back to dashboard
        </button>
      </GlassCard>
    );
  }

  if (!data || !surahs) {
    return (
      <GlassCard className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <p className="text-sm text-text-secondary">Loading your session…</p>
      </GlassCard>
    );
  }

  const session = data.appointment;
  const report = data.report;
  const pending = !report && session.hasEnded && session.status !== "CANCELLED";
  const badge = report
    ? { label: "Report submitted", className: "bg-night-success/15 text-night-success" }
    : pending
      ? { label: "Report pending", className: "bg-warning-muted text-warning" }
      : session.status === "CANCELLED"
        ? { label: "Cancelled", className: "bg-bg-hover text-text-muted" }
        : session.status === "ONGOING"
          ? { label: "In progress", className: "bg-primary/10 text-primary" }
          : { label: "Upcoming", className: "bg-bg-hover text-text-muted" };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            {session.isTeacher ? "Student" : "Teacher"}: {session.otherPartyName ?? "—"}
          </p>
          <h1 className="text-2xl font-bold text-text-primary">{session.title ?? "Session"}</h1>
          <p className="text-sm text-text-secondary">
            {new Date(session.startTime).toLocaleString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}>
            {badge.label}
          </span>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            Back to dashboard
          </button>
        </div>
      </header>

      {data.plan ? (
        <GlassCard className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">Session plan</p>
          <p className="mt-1 text-sm text-text-primary">{rangeLabel({
            fromSurah: data.plan.fromSurah,
            fromAyah: data.plan.fromVerse,
            toSurah: data.plan.toSurah,
            toAyah: data.plan.toVerse,
          })}</p>
        </GlassCard>
      ) : null}

      {inCall && call ? (
        <VideoRoom liveKitUrl={call.liveKitUrl} token={call.token} onLeave={leave} />
      ) : (
        <GlassCard className="flex flex-col items-center gap-4 p-8 text-center">
          {joinError ? <p className="text-sm text-warning">{joinError}</p> : null}
          {session.canJoin ? (
            <>
              <p className="text-sm text-text-secondary">
                {session.isTeacher
                  ? "Your student joins from their sessions list. Your camera and microphone start off."
                  : "Your teacher is in the room or on the way. Your camera and microphone start off."}
              </p>
              <button
                onClick={startCall}
                disabled={joining}
                className="inline-flex h-12 items-center rounded-[10px] bg-accent px-8 text-sm font-semibold text-text-inverse transition-all hover:brightness-95 disabled:opacity-50"
              >
                {joining ? "Joining…" : "Join now"}
              </button>
            </>
          ) : (
            <p className="text-sm text-text-secondary">
              {session.status === "CANCELLED"
                ? "This session was cancelled."
                : session.hasEnded
                  ? "This session has ended."
                  : "Joining opens fifteen minutes before the session starts."}
            </p>
          )}
        </GlassCard>
      )}

      {session.isTeacher ? (
        <PlanEditor
          appointmentId={session.id}
          initial={data.plan}
          surahs={surahs}
          onSaved={(plan) => setData((current) => (current ? { ...current, plan } : current))}
          notify={toast}
        />
      ) : null}

      {session.isTeacher ? (
        <ReportForm
          appointmentId={session.id}
          report={report}
          surahs={surahs}
          onSaved={(saved) => setData((current) => (current ? { ...current, report: saved } : current))}
          notify={toast}
        />
      ) : report ? (
        <ReportCard report={report} />
      ) : pending ? (
        <GlassCard className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">Lesson report</p>
          <p className="mt-1 text-sm text-text-secondary">
            Your teacher has not submitted the report for this session yet. It will appear here once
            it is ready.
          </p>
        </GlassCard>
      ) : null}

      <SessionNotes
        appointmentId={session.id}
        studentId={session.isTeacher ? session.studentId : null}
      />
    </div>
  );
}

function PlanEditor({
  appointmentId,
  initial,
  surahs,
  onSaved,
  notify,
}: {
  appointmentId: string;
  initial: SessionPlan | null;
  surahs: SurahOption[];
  onSaved: (plan: SessionPlan) => void;
  notify: (message: { title: string; variant?: "success" | "error" | "info" }) => void;
}) {
  const [range, setRange] = useState<RangeValue>({
    fromSurah: initial?.fromSurah ?? 1,
    fromAyah: initial?.fromVerse ?? 1,
    toSurah: initial?.toSurah ?? 1,
    toAyah: initial?.toVerse ?? 7,
  });
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/plan`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fromSurah: range.fromSurah,
          fromVerse: range.fromAyah,
          toSurah: range.toSurah,
          toVerse: range.toAyah,
        }),
      });
      if (response.ok) {
        onSaved({
          fromSurah: range.fromSurah,
          fromVerse: range.fromAyah,
          toSurah: range.toSurah,
          toVerse: range.toAyah,
        });
        notify({ title: "Session plan saved", variant: "success" });
      } else {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        notify({ title: body.error ?? "Could not save the plan", variant: "error" });
      }
    } catch {
      notify({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassCard className="p-5">
      <form onSubmit={save} className="flex flex-col gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          What this session covers
        </p>
        <RangeFields surahs={surahs} value={range} onChange={setRange} />
        <div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save plan"}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}

function ReportForm({
  appointmentId,
  report,
  surahs,
  onSaved,
  notify,
}: {
  appointmentId: string;
  report: LessonReport | null;
  surahs: SurahOption[];
  onSaved: (report: LessonReport) => void;
  notify: (message: { title: string; variant?: "success" | "error" | "info" }) => void;
}) {
  const [attendance, setAttendance] = useState<Attendance>(report?.attendance ?? "PRESENT");
  const [hasRange, setHasRange] = useState(report?.fromSurah != null);
  const [range, setRange] = useState<RangeValue>({
    fromSurah: report?.fromSurah ?? 1,
    fromAyah: report?.fromVerse ?? 1,
    toSurah: report?.toSurah ?? 1,
    toAyah: report?.toVerse ?? 7,
  });
  const [rating, setRating] = useState(report?.rating ? String(report.rating) : "");
  const [revision, setRevision] = useState(report?.revision ?? "");
  const [notes, setNotes] = useState(report?.notes ?? "");
  const [nextAssignment, setNextAssignment] = useState(report?.nextAssignment ?? "");
  const [saving, setSaving] = useState(false);

  const absent = attendance === "ABSENT" || attendance === "EXCUSED";

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/report`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          attendance,
          range: hasRange && !absent ? range : null,
          rating: rating ? Number(rating) : null,
          revision: revision.trim() || null,
          notes: notes.trim() || null,
          nextAssignment: nextAssignment.trim() || null,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { report?: LessonReport; error?: string };
      if (!response.ok || !body.report) {
        notify({ title: body.error ?? "Could not save the report", variant: "error" });
        return;
      }
      onSaved(body.report);
      notify({ title: "Lesson report saved", variant: "success" });
    } catch {
      notify({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const field =
    "w-full rounded-[10px] border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/60 focus:outline-none";

  return (
    <GlassCard className="p-5">
      <form onSubmit={save} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Lesson report
          </p>
          {report ? (
            <span className="rounded-full bg-night-success/15 px-2.5 py-1 text-[11px] font-semibold text-night-success">
              Submitted {new Date(report.submittedAt).toLocaleDateString()}
            </span>
          ) : (
            <span className="rounded-full bg-warning-muted px-2.5 py-1 text-[11px] font-semibold text-warning">
              Pending
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-medium text-text-secondary">
            Attendance
            <select
              value={attendance}
              onChange={(event) => {
                const value = event.target.value as Attendance;
                setAttendance(value);
                if (value === "ABSENT" || value === "EXCUSED") setHasRange(false);
              }}
              className={field}
            >
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="EXCUSED">Excused</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-text-secondary">
            Rating (optional)
            <select value={rating} onChange={(event) => setRating(event.target.value)} className={field}>
              <option value="">No rating</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={hasRange && !absent}
              disabled={absent}
              onChange={(event) => setHasRange(event.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            Record new memorisation
          </label>
          {hasRange && !absent ? (
            <RangeFields surahs={surahs} value={range} onChange={setRange} />
          ) : (
            <p className="text-xs text-text-secondary">
              {absent
                ? "A session the student missed cannot add new memorisation."
                : "Leave this off when the lesson was revision only."}
            </p>
          )}
        </div>

        <label className="flex flex-col gap-1 text-xs font-medium text-text-secondary">
          Revision covered
          <textarea
            value={revision}
            onChange={(event) => setRevision(event.target.value)}
            rows={2}
            className={field}
            placeholder="What was revised today"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-text-secondary">
          Notes for the student
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className={field}
            placeholder="Strengths, corrections, and what to watch"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-text-secondary">
          Next assignment
          <textarea
            value={nextAssignment}
            onChange={(event) => setNextAssignment(event.target.value)}
            rows={2}
            className={field}
            placeholder="What to prepare before the next session"
          />
        </label>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center rounded-[10px] bg-primary px-4 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : report ? "Update report" : "Submit report"}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}

function ReportCard({ report }: { report: LessonReport }) {
  const range =
    report.fromSurah !== null &&
    report.fromVerse !== null &&
    report.toSurah !== null &&
    report.toVerse !== null
      ? { fromSurah: report.fromSurah, fromAyah: report.fromVerse, toSurah: report.toSurah, toAyah: report.toVerse }
      : null;

  return (
    <GlassCard className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">Lesson report</p>
        <span className="text-xs text-text-muted">
          {ATTENDANCE_LABELS[report.attendance]} · {new Date(report.submittedAt).toLocaleDateString()}
        </span>
      </div>

      {range ? (
        <p className="text-sm text-text-primary">
          <span className="font-semibold">New memorisation:</span> {rangeLabel(range)}
        </p>
      ) : null}

      {report.rating ? (
        <p className="text-sm text-text-primary">
          <span className="font-semibold">Rating:</span> {report.rating} / 5
        </p>
      ) : null}

      {report.revision ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Revision</p>
          <p className="mt-1 whitespace-pre-line text-sm text-text-secondary">{report.revision}</p>
        </div>
      ) : null}

      {report.notes ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Notes</p>
          <p className="mt-1 whitespace-pre-line text-sm text-text-secondary">{report.notes}</p>
        </div>
      ) : null}

      {report.nextAssignment ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Next assignment</p>
          <p className="mt-1 whitespace-pre-line text-sm text-text-secondary">{report.nextAssignment}</p>
        </div>
      ) : null}
    </GlassCard>
  );
}
