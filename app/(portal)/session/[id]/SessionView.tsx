"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { GlassCard } from "@/app/ui/glass";
import { LessonJoinCard, type JoinStateUpdate } from "@/app/ui/LessonJoinCard";
import { LocalTime } from "@/app/ui/LocalTime";
import { Skeleton } from "@/app/ui/Skeleton";
import { StatusChip, type StatusTone } from "@/app/ui/chips";
import { Panel } from "@/app/ui/portal";
import { sessionTypeLabel, type JoinState, type PlanRange } from "@/lib/live-session";
import { BeforeLesson } from "./BeforeLesson";
import { LessonBrief, PendingReport, ReportCard } from "./LessonBrief";
import { MeetingLinkCard } from "./MeetingLinkCard";
import { PlanEditor } from "./PlanEditor";
import { ReportForm } from "./ReportForm";
import { SessionNotes } from "./SessionNotes";
import type { SummaryPayload, SurahOption, TeacherContext } from "./types";

interface SurahsPayload {
  surahs?: SurahOption[];
  error?: string;
}

const JOIN_CHIP: Record<JoinState, { label: string; tone: StatusTone }> = {
  open: { label: "Room open", tone: "success" },
  upcoming: { label: "Upcoming", tone: "info" },
  ended: { label: "Ended", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

const EMPTY_CONTEXT: TeacherContext = {
  lastStop: null,
  progress: { uniqueAyahs: 0, percent: 0, rangeCount: 0 },
  lastReport: null,
  lastNote: null,
  manzil: null,
  nextPlan: null,
  nextSessionAt: null,
};

/**
 * A session, before and after the call.
 *
 * The summary loads first so the plan and the report are visible without
 * entering a call — a teacher can set what the session covers, and submit the
 * report afterwards, while the student can read it long after joining closes.
 * The page changes shape with the session: preparation while it is still ahead,
 * the report once it has ended.
 */
export function SessionView({ appointmentId }: { appointmentId: string }) {
  const [data, setData] = useState<SummaryPayload | null>(null);
  const [surahs, setSurahs] = useState<SurahOption[] | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [summaryResponse, surahResponse] = await Promise.all([
          fetch(`/api/appointments/${appointmentId}/summary`, { cache: "no-store" }),
          fetch("/api/quran/surahs"),
        ]);
        const summaryBody = (await summaryResponse.json().catch(() => ({}))) as SummaryPayload & {
          error?: string;
        };
        const surahBody = (await surahResponse.json().catch(() => ({}))) as SurahsPayload;

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
  }, [appointmentId, reloadKey]);

  const retry = useCallback(() => {
    setError("");
    setData(null);
    setSurahs(null);
    setReloadKey((key) => key + 1);
  }, []);

  const updateJoin = useCallback((update: JoinStateUpdate) => {
    setData((current) =>
      current
        ? {
            ...current,
            appointment: {
              ...current.appointment,
              joinState: update.joinState,
              opensAt: update.opensAt,
              closesAt: update.closesAt,
            },
          }
        : current,
    );
  }, []);

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-6 py-16 text-center">
        <div role="alert" className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-bold text-text-primary">Cannot open this session</h1>
          <p className="text-sm text-text-secondary">{error}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary/90"
          >
            <RefreshCw aria-hidden className="size-4" />
            Try again
          </button>
          <Link
            href="/sessions"
            className="inline-flex min-h-11 items-center rounded-[10px] border border-border px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            Back to sessions
          </Link>
        </div>
      </div>
    );
  }

  if (!data || !surahs) return <SessionSkeleton />;

  const session = data.appointment;
  const report = data.report;
  const chip = JOIN_CHIP[session.joinState];
  const teacher = session.isTeacher;
  const phase =
    session.joinState === "ended" || session.status === "COMPLETED"
      ? "after"
      : session.joinState === "cancelled"
        ? "cancelled"
        : "before";
  const context = data.teacherContext ?? EMPTY_CONTEXT;
  const plan: PlanRange | null = data.plan;

  function guardNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!dirty) return;
    if (!window.confirm("You have unsaved changes. Leave this page and discard them?")) {
      event.preventDefault();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/sessions"
        onClick={guardNavigation}
        className="inline-flex w-fit items-center gap-1.5 rounded-[8px] text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-4 rtl:rotate-180" />
        All sessions
      </Link>

      <GlassCard grade="lantern" mashrabiya className="p-5 sm:p-6">
        <div className="relative flex flex-col gap-5">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                {teacher ? "Teaching" : "Lesson with"}{" "}
                <span className="text-text-primary">{session.otherPartyName ?? "—"}</span>
              </p>
              <h1 className="text-balance text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                {session.title ?? sessionTypeLabel(session.sessionType)}
              </h1>
              <p className="text-sm text-text-secondary">
                <LocalTime iso={session.startTime} mode="datetime" />
                {session.endTime ? (
                  <>
                    {" – "}
                    <LocalTime iso={session.endTime} mode="time" />
                  </>
                ) : null}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusChip tone="primary">{sessionTypeLabel(session.sessionType)}</StatusChip>
                <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
                {teacher && report ? (
                  <StatusChip tone="success">Report ready</StatusChip>
                ) : teacher && phase === "after" ? (
                  <StatusChip tone="warning">Report pending</StatusChip>
                ) : null}
              </div>
            </div>
          </header>

          {phase === "cancelled" ? (
            <p className="rounded-xl border border-danger/30 bg-danger-muted px-4 py-3 text-sm text-text-primary">
              This lesson was cancelled. Nothing needs to be prepared, and joining is closed.
            </p>
          ) : (
            <LessonJoinCard session={session} onJoinStateChange={updateJoin} />
          )}
        </div>
      </GlassCard>

      {teacher ? (
        phase === "before" ? (
          <>
            <BeforeLesson session={session} plan={plan} context={context} surahs={surahs} />
            <PlanEditor
              appointmentId={session.id}
              initial={data.plan}
              surahs={surahs}
              onSaved={(saved) =>
                setData((current) => (current ? { ...current, plan: saved } : current))
              }
            />
            <MeetingLinkCard appointmentId={session.id} />
          </>
        ) : phase === "after" ? (
          <>
            <ReportForm
              appointmentId={session.id}
              report={report}
              plan={data.plan}
              context={context}
              surahs={surahs}
              studentName={session.otherPartyName ?? "your student"}
              onDirtyChange={setDirty}
              onSaved={(saved) =>
                setData((current) =>
                  current
                    ? {
                        ...current,
                        report: saved,
                        appointment: {
                          ...current.appointment,
                          status: "COMPLETED",
                          joinState: "ended",
                        },
                      }
                    : current,
                )
              }
            />
            <LessonBrief plan={data.plan} surahs={surahs} isTeacher ended />
          </>
        ) : null
      ) : (
        <>
          <LessonBrief plan={data.plan} surahs={surahs} isTeacher={false} ended={phase === "after"} />
          {report ? (
            <ReportCard report={report} surahs={surahs} />
          ) : phase === "after" ? (
            <PendingReport />
          ) : phase === "before" ? (
            <BeforeYouJoin />
          ) : null}
        </>
      )}

      <SessionNotes
        appointmentId={session.id}
        studentId={teacher ? session.studentId : null}
      />
    </div>
  );
}

function BeforeYouJoin() {
  return (
    <Panel className="flex flex-col gap-3 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
        Before you join
      </p>
      <ul className="flex flex-col gap-2 text-sm text-text-secondary">
        <li>Join a few minutes early so the call is ready when the lesson starts.</li>
        <li>Use Chrome, or open the link in the Google Meet app if the browser struggles.</li>
        <li>Find a quiet spot and check your microphone before the lesson begins.</li>
      </ul>
    </Panel>
  );
}

function SessionSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8"
      aria-busy="true"
      aria-label="Loading session"
    >
      <Skeleton className="h-4 w-24" />
      <div className="rounded-2xl border border-border bg-bg-elevated p-6">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-7 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <div className="mt-5 flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-6 h-12 w-full sm:w-48" />
      </div>
      <div className="rounded-2xl border border-border bg-bg-elevated p-5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-4 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
      </div>
    </div>
  );
}
