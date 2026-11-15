"use client";

import { Check, Loader2 } from "lucide-react";
import { useId, useState } from "react";

import { Panel } from "@/app/ui/portal";
import { useToast } from "@/app/ui/toast";
import {
  planRangeLabel,
  rangeHint,
  type SurahLike,
} from "@/lib/live-session";
import { RangeFields, type RangeValue } from "./RangeFields";
import type { SessionPlan, SurahOption } from "./types";

function rangeValueOf(plan: SessionPlan | null): RangeValue {
  return {
    fromSurah: plan?.fromSurah ?? 1,
    fromAyah: plan?.fromVerse ?? 1,
    toSurah: plan?.toSurah ?? 1,
    toAyah: plan?.toVerse ?? 7,
  };
}

/**
 * What a session is meant to cover.
 *
 * Sabaq is derived from this plan on the report form, so saving here is what
 * gives the teacher a one-tap revision phrase after the session.
 */
export function PlanEditor({
  appointmentId,
  initial,
  surahs,
  onSaved,
}: {
  appointmentId: string;
  initial: SessionPlan | null;
  surahs: SurahOption[];
  onSaved: (plan: SessionPlan) => void;
}) {
  const { toast } = useToast();
  const hintId = useId();
  const [range, setRange] = useState<RangeValue>(() => rangeValueOf(initial));
  const [savedPlan, setSavedPlan] = useState<SessionPlan | null>(initial);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const hint = rangeHint(range, surahs as SurahLike[]);
  const invalid = !hint.valid;

  function updateRange(next: RangeValue) {
    setJustSaved(false);
    setRange(next);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (saving || invalid) return;

    setSaving(true);
    setJustSaved(false);

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
      const body = (await response.json().catch(() => ({}))) as {
        plan?: SessionPlan;
        error?: string;
      };

      if (!response.ok || !body.plan) {
        toast({ title: body.error ?? "Could not save the plan", variant: "error" });
        return;
      }

      setSavedPlan(body.plan);
      onSaved(body.plan);
      setJustSaved(true);
      toast({ title: "Session plan saved", variant: "success" });
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel className="flex flex-col gap-4 p-5" id="plan">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Session plan
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          {savedPlan
            ? `This session covers ${planRangeLabel(savedPlan, surahs as SurahLike[])}.`
            : "Set the range so the student knows what to prepare."}
        </p>
      </div>

      <form onSubmit={save} className="flex flex-col gap-3" noValidate>
        <RangeFields
          surahs={surahs}
          value={range}
          onChange={updateRange}
          invalid={invalid}
          describedBy={hintId}
        />

        <p
          id={hintId}
          aria-live="polite"
          className={`text-xs font-medium ${invalid ? "text-danger" : "text-text-secondary"}`}
        >
          {hint.message}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving || invalid}
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
            {saving ? "Saving…" : savedPlan ? "Update plan" : "Save plan"}
          </button>
          {justSaved ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <Check aria-hidden className="size-3.5" />
              Saved
            </span>
          ) : null}
        </div>
      </form>
    </Panel>
  );
}
