"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function DailySessionButton({
  startTime,
  endTime,
}: {
  startTime: string;
  endTime: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(startTime);
  const end = new Date(endTime);
  const canJoin = now >= start && now <= end;
  const isBefore = now < start;

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments/daily", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/session/${data.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to start session");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (isBefore) {
    const minsUntil = Math.round((start.getTime() - now.getTime()) / 60000);
    return (
      <div className="flex items-center gap-3 text-sm text-text-secondary">
        <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
        Coming up in {minsUntil} min
      </div>
    );
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading || !canJoin}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-text-inverse rounded-xl font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] shadow-sm shadow-primary/20"
    >
      {loading ? "Starting..." : canJoin ? "Start Session" : "Session ended"}
    </button>
  );
}
