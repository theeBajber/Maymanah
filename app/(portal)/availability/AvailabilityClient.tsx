"use client";

import { useEffect, useState } from "react";
import { useTopNavContent } from "@/lib/TopNavContext";
import { AvailabilityGrid } from "./AvailabilityGrid";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function AvailabilityClient({
  initialSlots,
}: {
  initialSlots: { dayOfWeek: number; startTime: string; endTime: string }[];
}) {
  const { setContent } = useTopNavContent();
  const [dayFilter, setDayFilter] = useState<number | null>(null);

  useEffect(() => {
    setContent(
      <div className="flex items-center gap-1">
        {DAY_LABELS.map((label, i) => {
          const active = dayFilter === i;
          return (
            <button
              key={i}
              onClick={() => setDayFilter(active ? null : i)}
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
  }, [setContent, dayFilter]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <section>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Weekly Availability</h1>
        <p className="text-sm text-text-secondary mt-1">
          Select <strong>all</strong> times you&apos;re available to teach. The more you add, the better the system can match students to your schedule.
        </p>
      </section>
      <AvailabilityGrid initialSlots={initialSlots} dayFilter={dayFilter} />
    </div>
  );
}
