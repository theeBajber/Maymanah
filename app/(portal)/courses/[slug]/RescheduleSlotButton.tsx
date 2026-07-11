"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { RescheduleDialog } from "@/components/ui/RescheduleDialog";

export function RescheduleSlotButton({
  mentorshipId,
  teacherId,
  sessionType,
  nextOccurrence,
}: {
  mentorshipId: string;
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
      const start = new Date(nextOccurrence);
      const end = new Date(start.getTime() + (sessionType === "MURAJA" ? 60 : 15) * 60000);
      const res = await fetch("/api/appointments/find-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorshipId,
          teacherId,
          sessionType,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppointmentId(data.id);
        setOpen(true);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-xs text-primary font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
      >
        <FontAwesomeIcon icon={faCalendar} className="size-3" />
        {loading ? "..." : "Reschedule this week"}
      </button>

      {open && appointmentId && (
        <RescheduleDialog
          appointmentId={appointmentId}
          teacherId={teacherId}
          mentorshipId={mentorshipId}
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
