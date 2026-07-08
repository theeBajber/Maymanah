"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export function UpcomingAppointmentCard({
  id,
  studentName,
  startTime,
  status,
  canJoin,
  canCancel,
}: {
  id: string;
  studentName: string;
  startTime: Date;
  status: string;
  canJoin: boolean;
  canCancel: boolean;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [showReschedulePicker, setShowReschedulePicker] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [mismatchHint, setMismatchHint] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
      }
    } catch {
      toast({ title: "Failed to cancel session", variant: "error" });
    } finally {
      setCancelling(false);
    }
  }

  async function handleReschedule() {
    if (!newDate || !newTime) return;
    setRescheduling(true);
    setMismatchHint(false);
    try {
      const startTime = new Date(`${newDate}T${newTime}`).toISOString();
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reschedule", startTime }),
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
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-36 px-2 py-1.5 text-xs rounded-lg border border-border bg-bg-primary text-text-primary"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-28 px-2 py-1.5 text-xs rounded-lg border border-border bg-bg-primary text-text-primary"
                />
                <button
                  onClick={handleReschedule}
                  disabled={rescheduling || !newDate || !newTime}
                  className="text-xs font-medium bg-primary text-text-inverse px-2.5 py-1.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {rescheduling ? "..." : "Save"}
                </button>
                <button
                  onClick={() => setShowReschedulePicker(false)}
                  className="text-xs text-text-muted hover:text-text-primary px-2"
                >
                  Back
                </button>
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
