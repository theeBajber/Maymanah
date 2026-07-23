"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";

export function DailySessionButton({
  startTime,
  endTime,
  isTest = false,
}: {
  startTime: string;
  endTime: string;
  isTest?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

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
        toast({ title: err.error || "Failed to start session", variant: "error" });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (isBefore) {
    const diff = start.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    let label: string;
    if (h > 0) label = `${h}h ${m}m`;
    else if (m > 0) label = `${m}m ${s}s`;
    else label = `${s}s`;
    return (
      <div className="flex items-center gap-3 text-sm text-text-secondary">
        <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
        Coming up in {label}
      </div>
    );
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading || !canJoin}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-text-inverse rounded-xl font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] hover:shadow-glow-brass"
    >
      {loading ? "Starting..." : canJoin ? (isTest ? "Force Start" : "Start Session") : "Session ended"}
    </button>
  );
}
