"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AvailabilityGrid,
  slotsToWindows,
  windowsToSlots,
  type SlotKey,
} from "@/app/ui/AvailabilityGrid";
import { Skeleton } from "@/app/ui/Skeleton";
import { useToast } from "@/app/ui/toast";

function durationLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} m`;
}

/**
 * The teacher's weekly availability editor.
 *
 * Shared between the settings panel and the standalone availability page, and
 * deliberately the same grid students use: a teacher paints the half-hours
 * they keep open, and the visible blocks are exactly the windows a student can
 * be scheduled into. Saving merges touching cells into ranges, so the stored
 * availability stays a short list rather than one row per half-hour.
 */
export function AvailabilityEditor({ heading = true }: { heading?: boolean }) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<SlotKey>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/availability")
      .then((response) => response.json())
      .then((data: { slots?: { dayOfWeek: number; startTime: string; endTime: string }[] }) => {
        setSelected(windowsToSlots(data.slots ?? []));
      })
      .catch(() => {
        toast({ title: "Could not load your availability", variant: "error" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: slotsToWindows(selected) }),
      });
      if (response.ok) {
        toast({ title: "Availability saved", variant: "success" });
      } else {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        toast({ title: data.error ?? "Could not save availability", variant: "error" });
      }
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const windows = slotsToWindows(selected);
  const totalMinutes = windows.reduce(
    (sum, window) => {
      const [startHour, startMinute] = window.startTime.split(":").map(Number);
      const [endHour, endMinute] = window.endTime.split(":").map(Number);
      return sum + (endHour * 60 + endMinute - (startHour * 60 + startMinute));
    },
    0,
  );
  const dayCount = new Set(windows.map((window) => window.dayOfWeek)).size;

  return (
    <div className="max-w-2xl">
      {heading ? (
        <h2 className="mb-2 text-2xl font-bold text-text-primary">Weekly availability</h2>
      ) : null}
      <p className={`text-sm text-text-secondary ${heading ? "mb-6" : "mb-5"}`}>
        Paint every half-hour you can teach. Students are paired inside these hours, and their
        daily sessions are booked from them. Blank means unavailable.
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <AvailabilityGrid selected={selected} onSelectedChange={setSelected} />

          <p className="mt-4 text-xs text-text-secondary">
            Drag across cells to select a block, or drag over a selected block to clear it. On a
            keyboard, tab to a cell and press Enter or Space to toggle it.
          </p>

          <p className="mt-3 text-sm text-text-secondary" aria-live="polite">
            {totalMinutes === 0
              ? "No time selected yet."
              : `${durationLabel(totalMinutes)} a week across ${dayCount} ${
                  dayCount === 1 ? "day" : "days"
                }.`}
          </p>
        </>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || loading}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-medium text-text-inverse transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 active:scale-[0.97] hover:shadow-glow-accent motion-reduce:transition-none"
      >
        <Save aria-hidden className="size-4" />
        {saving ? "Saving…" : "Save availability"}
      </button>
    </div>
  );
}
