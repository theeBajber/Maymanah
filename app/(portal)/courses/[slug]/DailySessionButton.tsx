"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useToast } from "@/app/ui/toast";

/**
 * Starts (or joins) the student's daily session for today.
 *
 * Counts down to the start so the button is not pressed hopefully an hour
 * early, and only enables once the slot has arrived. `?test=1` force-starts a
 * session on the spot, which the end-to-end suite uses in place of waiting.
 */
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
      const query = isTest ? "?test=1" : "";
      const response = await fetch(`/api/appointments/daily${query}`, { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        router.push(`/session/${data.id}${isTest ? "?test=1" : ""}`);
      } else {
        const data = await response.json().catch(() => ({}));
        toast({ title: data.error || "Failed to start session", variant: "error" });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (isBefore) {
    const diff = start.getTime() - now.getTime();
    const hours = Math.floor(diff / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const seconds = Math.floor((diff % 60_000) / 1_000);
    const label = hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    return (
      <div className="flex items-center gap-3 text-sm text-text-secondary">
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60" />
          <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
        </span>
        Coming up in {label}
      </div>
    );
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading || !canJoin}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-text-inverse transition-all hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Starting..." : canJoin ? (isTest ? "Force Start" : "Start Session") : "Session ended"}
    </button>
  );
}
