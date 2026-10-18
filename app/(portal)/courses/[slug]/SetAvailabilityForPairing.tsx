"use client";

import { Check, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AvailabilityGrid, parseSlotKey, type SlotKey } from "@/app/ui/AvailabilityGrid";
import { useToast } from "@/app/ui/toast";

/**
 * The weekly availability grid a student fills to be matched.
 *
 * Drag across cells to paint a block of times, then save: the availability is
 * written first, and only once it is stored is a match attempted, so a student
 * is never paired against a schedule the server did not receive.
 */
export function SetAvailabilityForPairing() {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<SlotKey>>(new Set());
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSaveAndPair() {
    if (selected.size === 0) {
      toast({ title: "Select at least one time slot.", variant: "warning" });
      return;
    }

    setSaving(true);
    const slots = Array.from(selected).map((key) => {
      const { day, start, end } = parseSlotKey(key);
      return { dayOfWeek: day, startTime: start, endTime: end };
    });

    try {
      const availability = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      if (!availability.ok) {
        toast({ title: "Failed to save availability. Try again.", variant: "error" });
        setSaving(false);
        return;
      }

      const pairing = await fetch("/api/mentorship/pair", { method: "POST" });
      if (!pairing.ok) {
        const data = await pairing.json().catch(() => ({}));
        toast({ title: data.error || "Could not find a teacher. Try different times.", variant: "error" });
        setSaving(false);
        return;
      }

      toast({ title: "You've been paired with a teacher!", variant: "success" });
      setSuccess(true);
      setTimeout(() => router.refresh(), 1500);
    } catch {
      toast({ title: "Something went wrong. Try again.", variant: "error" });
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-success/10">
          <Check className="size-6 text-success" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-text-primary">You&apos;re all set!</h3>
        <p className="text-sm text-text-secondary">Redirecting to your schedule...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <Clock className="size-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Set Your Weekly Availability</h3>
          <p className="text-xs text-text-secondary">
            Select <strong>ALL </strong> the times you&apos;re available — the more you pick, the more daily sessions
            you&apos;ll get. We&apos;ll match you with a teacher and create sessions on every overlapping weekday.
          </p>
        </div>
      </div>

      <AvailabilityGrid selected={selected} onSelectedChange={setSelected} />

      <p className="mt-4 text-xs text-text-muted">
        Click and drag to select multiple slots. Selected = available, blank = unavailable.
      </p>

      <div className="mt-5 flex items-center justify-end gap-3">
        <p className="text-[11px] text-text-muted">
          {selected.size} slot{selected.size !== 1 ? "s" : ""} selected
        </p>
        <button
          onClick={handleSaveAndPair}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-text-inverse transition-all hover:brightness-110 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Finding a teacher...
            </>
          ) : (
            "Save & Find Teacher"
          )}
        </button>
      </div>
    </div>
  );
}
