"use client";

import { ExternalLink, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { LocalTime } from "@/app/ui/LocalTime";
import type { JoinState } from "@/lib/live-session";

export interface JoinTarget {
  id: string;
  joinState: JoinState;
  opensAt: string;
  closesAt: string;
  isTeacher: boolean;
}

export interface JoinStateUpdate {
  joinState: JoinState;
  opensAt: string;
  closesAt: string;
}

interface JoinPayload {
  joinUrl: string;
  provider: "MANUAL" | "GOOGLE_MEET";
}

type JoinErrorCode =
  | "reauth"
  | "no_link"
  | "not_configured"
  | "provider_error"
  | "not_started"
  | "ended"
  | "cancelled"
  | "network";

interface JoinError {
  message: string;
  code: JoinErrorCode;
}

const BROWSER_HELP =
  "If the call doesn't load, open the link in Chrome or use the Google Meet app.";

/**
 * The one join flow used by the sessions screen and the session page.
 *
 * The button never decides whether the window is open: it renders the state the
 * server returned and re-checks the summary on focus and once a minute. The
 * join route still performs the real enforcement.
 */
export function LessonJoinCard({
  session,
  onJoinStateChange,
  className = "",
}: {
  session: JoinTarget;
  onJoinStateChange?: (update: JoinStateUpdate) => void;
  className?: string;
}) {
  const reasonId = useId();
  const notifyRef = useRef(onJoinStateChange);
  useEffect(() => {
    notifyRef.current = onJoinStateChange;
  }, [onJoinStateChange]);

  const [live, setLive] = useState<JoinStateUpdate | null>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<JoinError | null>(null);
  const [call, setCall] = useState<JoinPayload | null>(null);
  const inFlight = useRef(false);

  const joinState = live?.joinState ?? session.joinState;
  const opensAt = live?.opensAt ?? session.opensAt;

  useEffect(() => {
    if (joinState !== "upcoming" && joinState !== "open") return;

    let cancelled = false;

    async function refresh() {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch(`/api/appointments/${session.id}/summary`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const body = (await response.json().catch(() => ({}))) as {
          appointment?: JoinStateUpdate;
        };
        if (cancelled || !body.appointment) return;

        const update = {
          joinState: body.appointment.joinState,
          opensAt: body.appointment.opensAt,
          closesAt: body.appointment.closesAt,
        };
        setLive(update);
        notifyRef.current?.(update);
      } catch {
        // A failed poll leaves the last known state in place.
      }
    }

    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [joinState, session.id]);

  async function join() {
    if (inFlight.current) return;
    inFlight.current = true;
    setJoining(true);
    setError(null);

    try {
      const response = await fetch(`/api/appointments/${session.id}/join`);
      const body = (await response.json().catch(() => ({}))) as Partial<JoinPayload> & {
        error?: string;
        code?: JoinErrorCode;
      };

      if (!response.ok || !body.joinUrl || !body.provider) {
        const code = body.code ?? "provider_error";
        setError({
          message: body.error ?? "Could not join that session.",
          code,
        });

        if (code === "ended" || code === "cancelled") {
          const update = { joinState: code, opensAt, closesAt: session.closesAt };
          setLive(update);
          notifyRef.current?.(update);
        }
        return;
      }

      setCall({ joinUrl: body.joinUrl, provider: body.provider });

      // A browser may block a window opened after an await. The panel below
      // always offers the same link, so nobody is stuck if this is ignored.
      window.open(body.joinUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError({ message: "Could not reach the server.", code: "network" });
    } finally {
      inFlight.current = false;
      setJoining(false);
    }
  }

  const teacherFallback = session.isTeacher;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {call ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg-elevated p-4">
          <p className="text-sm text-text-primary">
            Your lesson room is ready. It opens in a new tab.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={call.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary/90"
            >
              <ExternalLink aria-hidden className="size-4" />
              Open meeting
            </a>
            <button
              type="button"
              onClick={() => setCall(null)}
              className="inline-flex min-h-11 items-center rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              Back to session
            </button>
          </div>
          <p className="text-xs text-text-secondary">
            {call.provider === "GOOGLE_MEET" ? "Google Meet room." : "Your teacher's meeting link."}{" "}
            {BROWSER_HELP}
          </p>
        </div>
      ) : (
        <>
          {error ? (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-xl border border-danger/30 bg-danger-muted p-3 text-sm text-text-primary"
            >
              <span className="flex items-start gap-2">
                <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
                <span>{error.message}</span>
              </span>
              {teacherFallback ? (
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 ps-6 text-sm">
                  {error.code === "reauth" ? (
                    <a
                      href="/settings"
                      className="font-semibold text-primary underline underline-offset-4"
                    >
                      Reconnect Google
                    </a>
                  ) : null}
                  <a
                    href="#meeting-link"
                    className="font-semibold text-primary underline underline-offset-4"
                  >
                    Add a fallback meeting link
                  </a>
                </span>
              ) : null}
              {error.code === "provider_error" || error.code === "network" ? (
                <button
                  type="button"
                  onClick={join}
                  disabled={joining}
                  className="ms-6 inline-flex min-h-9 w-fit items-center rounded-[8px] border border-border px-3 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50"
                >
                  Try again
                </button>
              ) : null}
            </div>
          ) : null}

          {joinState === "cancelled" ? (
            <p className="text-sm text-text-secondary">This lesson was cancelled.</p>
          ) : joinState === "ended" ? (
            <>
              <button
                type="button"
                disabled
                aria-describedby={reasonId}
                className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-[10px] border border-border bg-bg-hover px-6 text-sm font-semibold text-text-secondary sm:w-auto"
              >
                Lesson ended
              </button>
              <p id={reasonId} className="text-xs text-text-secondary">
                Joining has closed. The lesson report stays available below.
              </p>
            </>
          ) : joinState === "upcoming" ? (
            <>
              <button
                type="button"
                disabled
                aria-describedby={reasonId}
                className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-[10px] border border-border bg-bg-hover px-6 text-sm font-semibold text-text-secondary sm:w-auto"
              >
                Opens at <LocalTime iso={opensAt} mode="time" className="ms-1" />
              </button>
              <p id={reasonId} className="text-xs text-text-secondary">
                Joining opens 15 minutes before the lesson. The button updates on its own.
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={join}
                disabled={joining}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-6 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
              >
                {joining ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
                {joining ? "Opening…" : session.isTeacher ? "Start lesson" : "Join lesson"}
              </button>
              <p className="text-xs text-text-secondary">{BROWSER_HELP}</p>
              {session.isTeacher ? (
                <p className="text-xs text-text-secondary">
                  Automatic rooms can fail.{" "}
                  <a
                    href="#meeting-link"
                    className="font-semibold text-primary underline underline-offset-4"
                  >
                    Add a fallback meeting link
                  </a>
                  .
                </p>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
