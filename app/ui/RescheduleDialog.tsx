"use client";

import { CircleCheck, Loader2, Sun, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { useToast } from "@/app/ui/toast";
import { zonedParts } from "@/lib/timezone";

interface TimeSlot {
  label: string;
  startTime: string;
  endTime: string;
}

function dateInZone(instant: string | Date, timeZone: string): string {
  const parts = zonedParts(new Date(instant), timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function durationFor(sessionType: string): number {
  return sessionType === "MURAJA" ? 60 : 15;
}

/**
 * Moves a single session to another time on the teacher's calendar.
 *
 * The offered times are the teacher's free slots for the chosen date, so a
 * session cannot be moved onto a moment they are already booked. The picked
 * hour is sent as an instant, and the session keeps its own length.
 */
export function RescheduleDialog({
  appointmentId,
  teacherId,
  teacherTimeZone,
  currentStartTime,
  sessionType,
  onClose,
}: {
  appointmentId: string;
  teacherId: string;
  teacherTimeZone: string;
  currentStartTime: string;
  sessionType: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const duration = durationFor(sessionType);
  const [date, setDate] = useState(() => dateInZone(currentStartTime, teacherTimeZone));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = new URLSearchParams({ teacherId, date, durationMinutes: String(duration) });
        const res = await fetch(`/api/appointments/available-slots?${params}`);
        const data = res.ok ? await res.json() : { slots: [] };
        if (cancelled) return;
        setSlots(data.slots ?? []);
        setSelected(null);
        setFetching(false);
      } catch {
        if (cancelled) return;
        setSlots([]);
        setSelected(null);
        setFetching(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [date, teacherId, duration]);

  async function handleReschedule() {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: selected, durationMinutes: duration }),
      });
      if (res.ok) {
        toast({ title: "Session rescheduled", variant: "success" });
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ title: data.error || "Failed to reschedule", variant: "error" });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md space-y-5 rounded-2xl border border-border bg-bg-elevated p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Reschedule Session</h3>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl text-text-muted transition-all hover:bg-bg-hover hover:text-text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted">
            Select a new date
          </label>
          <input
            type="date"
            value={date}
            min={dateInZone(new Date(), teacherTimeZone)}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary transition-colors focus:border-primary focus:outline-none"
          />
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-text-muted" />
          </div>
        ) : slots.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-text-muted">No available slots on this date</p>
            <p className="mt-1 text-xs text-text-muted/60">Try another day</p>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted">
              Available times
            </label>
            <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto">
              {slots.map((slot, index) => {
                const isSelected = selected === slot.startTime;
                return (
                  <button
                    key={`${slot.startTime}-${index}`}
                    onClick={() => setSelected(slot.startTime)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-text-secondary hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    {isSelected ? (
                      <CircleCheck className="size-3.5 shrink-0 text-primary" />
                    ) : sessionType === "DAILY_HIFDH" ? (
                      <Sun className="size-3.5 shrink-0 text-text-muted" />
                    ) : (
                      <Zap className="size-3.5 shrink-0 text-text-muted" />
                    )}
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition-all hover:bg-bg-hover"
          >
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            disabled={!selected || submitting}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-text-inverse transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Rescheduling..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
