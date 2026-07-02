"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const router = useRouter();

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
      alert("Failed to cancel session");
    } finally {
      setCancelling(false);
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
      </div>
    </div>
  );
}
