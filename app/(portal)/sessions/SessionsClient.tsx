"use client";

import { useEffect, useState, useMemo } from "react";
import { useTopNavContent } from "@/lib/TopNavContext";
import Link from "next/link";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type SlotData = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  type: string;
  studentName?: string;
  studentId?: string;
};

export default function SessionsClient({
  role,
  slots,
  todayDay,
  todaySlots,
  teacherName,
}: {
  role: "TEACHER" | "STUDENT";
  slots: SlotData[];
  todayDay: number;
  todaySlots?: SlotData[];
  teacherName?: string;
}) {
  const { setContent } = useTopNavContent();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    setContent(
      <div className="flex items-center gap-1">
        {dayLabels.map((label, i) => {
          const active = selectedDay === i;
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(active ? null : i)}
              className={`size-8 rounded-lg text-xs font-semibold transition-all ${
                active
                  ? "bg-primary text-text-inverse shadow-sm shadow-primary/30"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>,
    );
    return () => setContent(null);
  }, [setContent, selectedDay]);

  const filteredSlots = useMemo(
    () =>
      selectedDay !== null
        ? slots.filter((s) => s.dayOfWeek === selectedDay)
        : slots,
    [slots, selectedDay],
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Sessions</h1>

      {role === "TEACHER" && todaySlots && todaySlots.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Today</h2>
          <div className="space-y-2">
            {todaySlots.map((s) => (
              <div key={s.id} className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">
                    {s.studentName ?? "Student"}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {s.type === "DAILY_HIFDH" ? "Hifdh" : "Muraja'ah"} · {s.startTime}
                  </p>
                </div>
                {s.studentId && (
                  <Link
                    href={`/students/${s.studentId}`}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    View Student
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {role === "STUDENT" && teacherName && (
        <p className="text-sm text-text-secondary">
          Teacher: {teacherName}
        </p>
      )}

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3">
          {selectedDay !== null ? DAY_NAMES[selectedDay] : "Weekly Schedule"}
        </h2>
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: selectedDay !== null ? "1fr" : "repeat(7, 1fr)",
          }}
        >
          {(selectedDay !== null ? [selectedDay] : Array.from({ length: 7 }, (_, i) => i)).map(
            (day) => {
              const daySlots = selectedDay !== null
                ? filteredSlots
                : slots.filter((s) => s.dayOfWeek === day);
              const isToday = day === todayDay;
              return (
                <div
                  key={day}
                  className={`rounded-xl border p-3 ${isToday ? "border-primary/30 bg-primary/5" : "border-border bg-bg-elevated"}`}
                >
                  <p className="text-[11px] font-semibold text-text-muted uppercase mb-2">
                    {DAY_NAMES[day]}
                  </p>
                  <div className="space-y-1.5">
                    {daySlots.length === 0 ? (
                      <p className="text-[11px] text-text-muted">—</p>
                    ) : (
                      daySlots.map((s) => (
                        <div key={s.id} className="text-xs bg-bg-hover rounded-lg px-2 py-1.5">
                          {role === "STUDENT" ? (
                            <>
                              <p className="font-medium text-text-primary">
                                {s.type === "DAILY_HIFDH" ? "Hifdh" : "Muraja'ah"}
                              </p>
                              <p className="text-text-muted">{s.startTime}</p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-text-primary truncate">
                                {s.studentName?.split(" ")[0] ?? "S"}
                              </p>
                              <p className="text-text-muted">{s.startTime}</p>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </section>
    </div>
  );
}
