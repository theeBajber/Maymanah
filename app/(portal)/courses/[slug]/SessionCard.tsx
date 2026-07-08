"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faSun,
  faBolt,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { RescheduleDialog } from "@/components/ui/RescheduleDialog";

interface SessionCardAppointment {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  sessionType: string;
  joinedAt: string | null;
  missed: boolean;
  teacher: { id: string; name: string | null; image: string | null } | null;
}

export function UpcomingSessionCard({
  appointment,
  teacherId,
  mentorshipId,
}: {
  appointment: SessionCardAppointment;
  teacherId: string;
  mentorshipId: string;
}) {
  const [showReschedule, setShowReschedule] = useState(false);
  const start = new Date(appointment.startTime);
  const now = new Date();
  const canJoin = now >= start && (!appointment.endTime || now <= new Date(appointment.endTime));

  function formatDate(date: Date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    if (date.toDateString() === today.toDateString()) return `Today at ${time}`;
    if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow at ${time}`;
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-elevated hover:border-primary/20 transition-all">
        <div className="relative shrink-0 size-11 rounded-xl bg-primary/10 flex items-center justify-center">
          <FontAwesomeIcon
            icon={appointment.sessionType === "DAILY_HIFDH" ? faSun : faBolt}
            className="text-primary size-4"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate text-text-primary text-sm">
            {appointment.sessionType === "DAILY_HIFDH"
              ? "Daily Hifdh"
              : appointment.sessionType === "MURAJA"
                ? "Muraja'ah Session"
                : appointment.title || "Session"}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {formatDate(start)}
            {appointment.teacher && ` — ${appointment.teacher.name || "Teacher"}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canJoin && (
            <Link
              href={`/session/${appointment.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-text-inverse text-xs font-bold hover:brightness-110 transition-all"
            >
              Join
              <FontAwesomeIcon icon={faArrowRight} className="size-3" />
            </Link>
          )}
          <button
            onClick={() => setShowReschedule(true)}
            className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs font-bold hover:bg-primary/5 transition-all"
          >
            Reschedule
          </button>
        </div>
      </div>

      {showReschedule && (
        <RescheduleDialog
          appointmentId={appointment.id}
          teacherId={teacherId}
          mentorshipId={mentorshipId}
          currentStartTime={appointment.startTime}
          sessionType={appointment.sessionType}
          onClose={() => setShowReschedule(false)}
        />
      )}
    </>
  );
}
