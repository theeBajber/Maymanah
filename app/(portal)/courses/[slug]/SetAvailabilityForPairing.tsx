"use client";

import { Check, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "@/app/ui/toast";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 5);
const MINUTES = [0, 30];
const FIRST_HOUR = HOURS[0];

type SlotKey = `${number}-${string}-${string}`;

function toSlotKey(day: number, start: string, end: string): SlotKey {
  return `${day}-${start}-${end}`;
}

function parseSlotKey(key: SlotKey) {
  const [day, start, end] = key.split("-");
  return { day: parseInt(day, 10), start, end };
}

function cellKey(row: number, day: number): SlotKey {
  const hourOffset = Math.floor(row / MINUTES.length);
  const min = (row % MINUTES.length) * (60 / MINUTES.length);
  const hour = FIRST_HOUR + hourOffset;
  const start = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  const endMin = min === 0 ? 30 : 0;
  const endHour = min === 0 ? hour : hour + 1;
  const end = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
  return toSlotKey(day, start, end);
}

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

  const dragActionRef = useRef<"add" | "remove" | null>(null);
  const isDraggingRef = useRef(false);
  const anchorRef = useRef<{ row: number; day: number } | null>(null);
  const prevRectKeysRef = useRef<Set<SlotKey> | null>(null);
  const preDragSelectedRef = useRef<Set<SlotKey> | null>(null);

  const rectKeys = useCallback((anchorRow: number, anchorDay: number, currentRow: number, currentDay: number) => {
    const keys = new Set<SlotKey>();
    for (let r = Math.min(anchorRow, currentRow); r <= Math.max(anchorRow, currentRow); r++) {
      for (let d = Math.min(anchorDay, currentDay); d <= Math.max(anchorDay, currentDay); d++) {
        keys.add(cellKey(r, d));
      }
    }
    return keys;
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      dragActionRef.current = null;
      anchorRef.current = null;
      prevRectKeysRef.current = null;
      preDragSelectedRef.current = null;
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleCellMouseDown = useCallback(
    (row: number, day: number) => {
      const key = cellKey(row, day);
      dragActionRef.current = selected.has(key) ? "remove" : "add";
      isDraggingRef.current = true;
      anchorRef.current = { row, day };
      preDragSelectedRef.current = new Set(selected);
      prevRectKeysRef.current = new Set<SlotKey>([key]);
      setSelected((prev) => {
        const next = new Set(prev);
        if (dragActionRef.current === "add") next.add(key);
        else next.delete(key);
        return next;
      });
    },
    [selected],
  );

  const handleCellMouseEnter = useCallback(
    (row: number, day: number) => {
      if (!isDraggingRef.current || !anchorRef.current) return;
      const next = rectKeys(anchorRef.current.row, anchorRef.current.day, row, day);
      if (prevRectKeysRef.current && next.size === prevRectKeysRef.current.size && [...next].every((key) => prevRectKeysRef.current!.has(key))) {
        return;
      }
      prevRectKeysRef.current = next;
      setSelected(() => {
        const base = preDragSelectedRef.current!;
        const draft = new Set(base);
        for (const key of next) {
          if (dragActionRef.current === "add") draft.add(key);
          else draft.delete(key);
        }
        return draft;
      });
    },
    [rectKeys],
  );

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

      <div className="overflow-x-auto">
        <div
          className="grid min-w-[500px] gap-px overflow-hidden rounded-xl bg-border"
          style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
        >
          <div className="bg-bg-card p-2 text-center text-[10px] font-semibold text-text-secondary" />
          {DAYS.map((day) => (
            <div key={day} className="bg-bg-card p-2 text-center text-[10px] font-semibold text-text-secondary">
              {day}
            </div>
          ))}
          {HOURS.map((hour, hourIndex) =>
            MINUTES.map((min, minIndex) => {
              const rowIndex = hourIndex * MINUTES.length + minIndex;
              const start = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
              const endMin = min === 0 ? 30 : 0;
              const endHour = min === 0 ? hour : hour + 1;
              const end = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
              return (
                <div key={`${hour}-${min}`} className="contents">
                  <div className="flex items-center justify-center bg-bg-card text-[9px] text-text-muted">
                    {min === 0 ? `${hour}:00` : ""}
                  </div>
                  {Array.from({ length: 7 }, (_, day) => {
                    const key = toSlotKey(day, start, end);
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-label={`${DAYS[day]} ${start}`}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleCellMouseDown(rowIndex, day);
                        }}
                        onMouseEnter={() => handleCellMouseEnter(rowIndex, day)}
                        className={`h-7 select-none transition-colors ${
                          selected.has(key) ? "bg-primary" : "bg-bg-card hover:bg-bg-hover"
                        }`}
                      />
                    );
                  })}
                </div>
              );
            }),
          )}
        </div>
      </div>

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
