"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/components/ui/toast";

interface TimeSlot {
  startTime: string;
  endTime: string;
  type: string;
}

export function UpcomingAppointmentCard({
  id,
  studentName,
  studentId,
  teacherId,
  startTime,
  status,
  canJoin,
  canCancel,
}: {
  id: string;
  studentName: string;
  studentId?: string;
  teacherId?: string;
  startTime: Date;
  status: string;
  canJoin: boolean;
  canCancel: boolean;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [showReschedulePicker, setShowReschedulePicker] = useState(false);
  const [date, setDate] = useState(startTime.toISOString().split("T")[0]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [mismatchHint, setMismatchHint] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchSlots = useCallback(async (selectedDate: string, student: string, teacher: string) => {
    setFetching(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(
        `/api/appointments/available-slots?studentId=${student}&teacherId=${teacher}&date=${selectedDate}&sessionType=DAILY_HIFDH`,
      );
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.slots ?? []);
      } else {
        setAvailableSlots([]);
      }
    } catch {
      setAvailableSlots([]);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (showReschedulePicker && studentId && teacherId && date) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSlots(date, studentId, teacherId);
    }
  }, [showReschedulePicker, studentId, teacherId, date, fetchSlots]);

  useEffect(() => {
    if (showReschedulePicker) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDate(startTime.toISOString().split("T")[0]);
    }
  }, [showReschedulePicker, startTime]);

  async function handleCancel() {
    if (!confirm("Cancel this session?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        toast({ variant: "error", title: "Failed to cancel session" });
      }
    } catch {
      toast({ title: "Failed to cancel session", variant: "error" });
    } finally {
      setCancelling(false);
    }
  }

  async function handleReschedule() {
    if (!selectedSlot) return;
    setRescheduling(true);
    setMismatchHint(false);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reschedule", startTime: selectedSlot }),
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: "Session rescheduled", variant: "success" });
        if (data.availabilityMismatch) {
          setMismatchHint(true);
        }
        setShowReschedulePicker(false);
        router.refresh();
      } else {
        const err = await res.json();
        toast({ title: err.error || "Failed to reschedule", variant: "error" });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setRescheduling(false);
    }
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDate(date: Date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const time = formatTime(date);
    if (isToday) return `Today at ${time}`;
    if (isTomorrow) return `Tomorrow at ${time}`;
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-text-primary">{studentName}</p>
        <p className="text-sm text-text-secondary">{formatDate(startTime)}</p>
        {mismatchHint && (
          <p className="text-xs text-warning mt-1">
            Student may need to update their availability for this new time.
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            status === "SCHEDULED"
              ? "bg-info/10 text-info"
              : status === "ONGOING"
                ? "bg-warning/10 text-warning"
                : status === "COMPLETED"
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
          }`}
        >
          {status}
        </span>
        {status === "SCHEDULED" && (
          <>
            {canJoin && (
              <Link
                href={`/session/${id}`}
                className="text-sm font-medium bg-secondary text-text-inverse px-3 py-1.5 rounded-lg hover:brightness-110 transition-all"
              >
                Join
              </Link>
            )}
            {showReschedulePicker ? (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <input
                  type="date"
                  value={date}
                  min={minDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-bg-primary text-text-primary"
                />
                {fetching ? (
                  <div className="flex items-center justify-center py-2">
                    <FontAwesomeIcon icon={faSpinner} className="size-4 text-text-muted animate-spin" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-[11px] text-text-muted text-center py-1">
                    No available slots on this date
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
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
                          className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-text-secondary hover:border-primary/30"
                          }`}
                        >
                          <FontAwesomeIcon icon={faSun} className="size-3 mr-1" />
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowReschedulePicker(false)}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-border text-text-muted hover:bg-bg-hover"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={rescheduling || !selectedSlot}
                    className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-primary text-text-inverse hover:brightness-110 disabled:opacity-50"
                  >
                    {rescheduling ? "..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowReschedulePicker(true)}
                  className="text-sm border border-primary/30 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Reschedule
                </button>
                {canCancel && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="text-sm border border-danger/30 text-danger px-3 py-1.5 rounded-lg hover:bg-danger/5 transition-colors disabled:opacity-50"
                  >
                    {cancelling ? "..." : "Cancel"}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
