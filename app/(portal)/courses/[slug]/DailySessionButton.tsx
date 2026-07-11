"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";

export function DailySessionButton({
  startTime,
  endTime,
}: {
  startTime: string;
  endTime: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const isTest = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("test");
  const start = new Date(startTime);
  const end = new Date(endTime);
  const canJoin = isTest || (now >= start && now <= end);
  const isBefore = !isTest && now < start;

  async function handleStart() {
    setLoading(true);
    try {
      const qs = isTest ? "?test=1" : "";
      const res = await fetch(`/api/appointments/daily${qs}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/session/${data.id}${isTest ? "?test=1" : ""}`);
      } else {
        const err = await res.json();
        toast({ variant: "error", title: err.error || "Failed to start session" });
      }
    } catch {
      toast({ variant: "error", title: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  if (isBefore) {
    const minsUntil = Math.round((start.getTime() - now.getTime()) / 60000);
    return (
      <div className="flex items-center gap-3 text-sm text-text-secondary">
        <span className="size-2 rounded-full bg-warning animate-pulse" />
        Coming up in {minsUntil} min
      </div>
    );
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading || !canJoin}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-text-inverse rounded-xl font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] hover:shadow-glow-brass"
    >
      {loading ? "Starting..." : canJoin ? "Start Session" : "Session ended"}
    </button>
  );
}
