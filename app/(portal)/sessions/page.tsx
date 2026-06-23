"use client";

import { faVideo, faSpinner, faCalendar, faClock, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AppointmentItem {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  meetingUrl: string | null;
  teacher: { id: string; name: string | null; image: string | null } | null;
  student: { id: string; name: string | null; image: string | null } | null;
}

export default function SessionsPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (authStatus !== "authenticated") return;

    fetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => {
        setAppointments(data.appointments ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authStatus, router]);

  const isTeacher = session?.user?.role === "TEACHER";

  const upcoming = appointments.filter(
    (a) => a.status === "SCHEDULED" && new Date(a.startTime) > new Date(),
  );
  const past = appointments.filter(
    (a) => a.status === "COMPLETED" || new Date(a.startTime) <= new Date(),
  );

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FontAwesomeIcon icon={faSpinner} className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  const formatDate = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    if (isToday) return `Today at ${time}`;
    if (isTomorrow) return `Tomorrow at ${time}`;
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          {isTeacher ? "My Sessions" : "My Sessions"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {isTeacher ? "View and manage your teaching sessions" : "Track your upcoming and past learning sessions"}
        </p>
      </div>

      {upcoming.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-success" />
            Upcoming
          </h2>
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-2xl border border-border bg-bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faVideo} className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-text-primary truncate">
                        {a.title || "Live Session"}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendar} className="size-3" />
                          {formatDate(a.startTime)}
                        </span>
                        {a.endTime && (
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faClock} className="size-3" />
                            {Math.round((new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000)} min
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        {isTeacher
                          ? `with ${a.student?.name || "Student"}`
                          : `with ${a.teacher?.name || "Teacher"}`}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/session/${a.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-text-inverse rounded-xl text-sm font-medium hover:brightness-110 transition-all shrink-0 active:scale-[0.97]"
                  >
                    Join
                    <FontAwesomeIcon icon={faArrowRight} className="size-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-16">
          <div className="size-16 rounded-full bg-bg-hover mx-auto mb-4 flex items-center justify-center">
            <FontAwesomeIcon icon={faVideo} className="size-6 text-text-muted" />
          </div>
          <h3 className="font-semibold text-text-primary mb-1">No sessions yet</h3>
          <p className="text-sm text-text-secondary">
            {isTeacher
              ? "Sessions will appear here once you have students."
              : "Your scheduled sessions with teachers will appear here."}
          </p>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-text-muted" />
            Past Sessions
          </h2>
          <div className="space-y-2">
            {past.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-border bg-bg-card opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full bg-bg-hover flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faVideo} className="size-3 text-text-muted" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm text-text-primary truncate">
                        {a.title || "Live Session"}
                      </h3>
                      <p className="text-xs text-text-muted">
                        {formatDate(a.startTime)}
                        {isTeacher
                          ? ` — with ${a.student?.name || "Student"}`
                          : ` — with ${a.teacher?.name || "Teacher"}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted shrink-0">
                    {a.status === "COMPLETED" ? "Completed" : "Missed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
