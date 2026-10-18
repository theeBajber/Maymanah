"use client";

import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { RescheduleDialog } from "@/app/ui/RescheduleDialog";

/**
 * Moves this week's instance of a recurring slot.
 *
 * The appointment for that occurrence is found or created first, then the
 * picker works on that single session, so only one day moves and the weekly
 * slot itself is untouched.
 */
export function RescheduleSlotButton({
  teacherId,
  sessionType,
  nextOccurrence,
}: {
  teacherId: string;
  sessionType: string;
  nextOccurrence: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments/find-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          startTime: nextOccurrence,
          durationMinutes: sessionType === "MURAJA" ? 60 : 15,
          sessionType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppointmentId(data.id);
        setOpen(true);
      }
    } catch {
      // A failed lookup leaves the button as it was; the next click tries again.
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
      >
        <Calendar className="size-3" />
        {loading ? "..." : "Reschedule this week"}
      </button>

      {open && appointmentId && (
        <RescheduleDialog
          appointmentId={appointmentId}
          teacherId={teacherId}
          currentStartTime={nextOccurrence}
          sessionType={sessionType}
          onClose={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
