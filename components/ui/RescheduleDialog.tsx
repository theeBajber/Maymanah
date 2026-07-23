"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faSun,
  faBolt,
  faSpinner,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/components/ui/toast";

interface TimeSlot {
  startTime: string;
  endTime: string;
  type: string;
}

export function RescheduleDialog({
  appointmentId,
  teacherId,
  mentorshipId,
  currentStartTime,
  sessionType,
  onClose,
}: {
  appointmentId: string;
  teacherId: string;
  mentorshipId: string;
  currentStartTime: string;
  sessionType: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState(() => {
    const d = new Date(currentStartTime);
    return d.toISOString().split("T")[0];
  });
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSlots = useCallback(async (selectedDate: string) => {
    setFetching(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(
        `/api/appointments/available-slots?teacherId=${teacherId}&mentorshipId=${mentorshipId}&date=${selectedDate}&sessionType=${sessionType}`,
      );
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.slots ?? []);
      }
    } catch {
      // silent
    } finally {
      setFetching(false);
    }
  }, [teacherId, mentorshipId, sessionType]);

  useEffect(() => {
    if (date)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSlots(date);
  }, [date, fetchSlots]);

  async function handleReschedule() {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          startTime: selectedSlot,
        }),
      });
      if (res.ok) {
        toast({ title: "Session rescheduled", variant: "success" });
        onClose();
        router.refresh();
      } else {
        const err = await res.json();
        toast({ title: err.error || "Failed to reschedule", variant: "error" });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  const now = new Date();
  const minDate = now.toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-elevated border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Reschedule Session</h3>
          <button onClick={onClose} className="size-8 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all">
            <FontAwesomeIcon icon={faXmark} className="size-4" />
          </button>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">
            Select a new date
          </label>
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <FontAwesomeIcon icon={faSpinner} className="size-5 text-text-muted animate-spin" />
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">No available slots on this date</p>
            <p className="text-xs text-text-muted/60 mt-1">Try another day</p>
          </div>
        ) : (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">
              Available times
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
              {availableSlots.map((slot, idx) => {
                const time = new Date(slot.startTime).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                });
                const isSelected = selectedSlot === slot.startTime;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedSlot(slot.startTime)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-text-secondary hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isSelected ? faCircleCheck : slot.type === "DAILY_HIFDH" ? faSun : faBolt}
                      className={`size-3.5 shrink-0 ${isSelected ? "text-primary" : "text-text-muted"}`}
                    />
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-semibold hover:bg-bg-hover transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            disabled={!selectedSlot || submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-text-inverse text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Rescheduling..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
