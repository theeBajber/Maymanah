"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { VideoRoom } from "@/app/ui/VideoRoom";
import { GlassCard } from "@/app/ui/glass";
import { useToast } from "@/app/ui/toast";

interface SessionPlan {
  fromSurah: number;
  fromVerse: number;
  toSurah: number;
  toVerse: number;
}

interface JoinPayload {
  token: string;
  roomName: string;
  liveKitUrl: string;
  otherUserId: string;
  appointment: { id: string; title: string | null; startTime: string; status: string; isTeacher: boolean };
  plan: SessionPlan | null;
}

/**
 * A session, from joining through the call itself.
 *
 * Fetches admission once, then hands the token to the room. The plan is shown
 * to both sides; only the teacher sees the editor, since setting what is
 * covered is the teacher's job and an editable plan in front of a student
 * invites confusion about who decides.
 */
export function SessionView({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [join, setJoin] = useState<JoinPayload | null>(null);
  const [error, setError] = useState("");
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/appointments/${appointmentId}/join`)
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as Partial<JoinPayload> & { error?: string };
        if (cancelled) return;
        if (!response.ok || !body.token || !body.liveKitUrl) {
          setError(body.error ?? "Could not join that session.");
          return;
        }
        setJoin(body as JoinPayload);
      })
      .catch(() => {
        if (!cancelled) setError("Could not reach the server.");
      });

    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  const leave = useCallback(() => {
    setInCall(false);
    router.push("/dashboard");
    router.refresh();
  }, [router]);

  if (error) {
    return (
      <GlassCard className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <h1 className="text-xl font-bold text-text-primary">Cannot join right now</h1>
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex h-11 items-center rounded-[10px] bg-brass px-6 text-sm font-semibold text-layl-deep transition-all hover:bg-[#D2AF6B]"
        >
          Back to dashboard
        </button>
      </GlassCard>
    );
  }

  if (!join) {
    return (
      <GlassCard className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <p className="text-sm text-text-secondary">Joining your session…</p>
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold text-text-primary">
          {join.appointment.title ?? "Session"}
        </h1>
        <button onClick={() => router.push("/dashboard")} className="text-sm font-semibold text-text-secondary hover:text-text-primary">
          Back to dashboard
        </button>
      </header>

      {join.plan ? (
        <GlassCard className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">Session plan</p>
          <p className="mt-1 text-sm text-text-primary">
            Surah {join.plan.fromSurah}:{join.plan.fromVerse} to Surah {join.plan.toSurah}:{join.plan.toVerse}
          </p>
        </GlassCard>
      ) : null}

      {!inCall ? (
        <GlassCard className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-sm text-text-secondary">
            {join.appointment.isTeacher
              ? "Your student joins from their sessions list. Your camera and microphone start off."
              : "Your teacher is in the room or on the way. Your camera and microphone start off."}
          </p>
          <button
            onClick={() => setInCall(true)}
            className="inline-flex h-12 items-center rounded-[10px] bg-brass px-8 text-sm font-semibold text-layl-deep transition-all hover:bg-[#D2AF6B]"
          >
            Join now
          </button>
        </GlassCard>
      ) : (
        <VideoRoom liveKitUrl={join.liveKitUrl} token={join.token} onLeave={leave} />
      )}

      {join.appointment.isTeacher ? (
        <PlanEditor appointmentId={join.appointment.id} initial={join.plan} notify={toast} />
      ) : null}
    </div>
  );
}

function PlanEditor({
  appointmentId,
  initial,
  notify,
}: {
  appointmentId: string;
  initial: SessionPlan | null;
  notify: (message: { title: string; variant?: "success" | "error" | "info" }) => void;
}) {
  const [plan, setPlan] = useState({ fromSurah: initial?.fromSurah ?? 1, fromVerse: initial?.fromVerse ?? 1, toSurah: initial?.toSurah ?? 1, toVerse: initial?.toVerse ?? 7 });
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/plan`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(plan),
      });
      if (response.ok) {
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

  const field = "w-20 rounded-[10px] border border-ivory/10 bg-ivory/[0.04] px-3 py-2 text-sm text-ivory focus:border-brass/60 focus:outline-none";

  return (
    <GlassCard className="p-5">
      <form onSubmit={save} className="flex flex-col gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          What this session covers
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          <label className="flex items-center gap-2">
            Surah
            <input type="number" min={1} max={114} value={plan.fromSurah} onChange={(e) => setPlan({ ...plan, fromSurah: Number(e.target.value) })} className={field} />
            :
            <input type="number" min={1} value={plan.fromVerse} onChange={(e) => setPlan({ ...plan, fromVerse: Number(e.target.value) })} className={field} />
          </label>
          <span aria-hidden>→</span>
          <label className="flex items-center gap-2">
            Surah
            <input type="number" min={1} max={114} value={plan.toSurah} onChange={(e) => setPlan({ ...plan, toSurah: Number(e.target.value) })} className={field} />
            :
            <input type="number" min={1} value={plan.toVerse} onChange={(e) => setPlan({ ...plan, toVerse: Number(e.target.value) })} className={field} />
          </label>
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
