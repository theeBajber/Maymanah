"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/ui/toast";
import { RescheduleAvailabilityButton } from "./RescheduleAvailabilityButton";

/**
 * The controls beneath a student's weekly schedule.
 *
 * When a session has been moved outside their availability, the notice names
 * the conflict and offers the two useful answers: widen the hours, or end the
 * pairing and be matched with someone else.
 */
export function ScheduleSectionClient({
  mentorshipId,
  teacherAvail,
  mismatchNotifications,
}: {
  mentorshipId: string;
  teacherAvail: { dayOfWeek: number; startTime: string; endTime: string }[];
  mismatchNotifications: { id: string; body: string | null }[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [autoOpen, setAutoOpen] = useState(false);
  const [repairing, setRepairing] = useState(false);

  async function handleRePair() {
    setRepairing(true);
    try {
      const res = await fetch(`/api/mentorship/${mentorshipId}/re-pair`, { method: "POST" });
      if (res.ok) {
        await Promise.all(
          mismatchNotifications.map((notification) =>
            fetch("/api/notifications/read", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: [notification.id] }),
            }).catch(() => {}),
          ),
        );
        router.refresh();
      } else {
        toast({ title: "Failed to re-pair. Try again.", variant: "error" });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setRepairing(false);
    }
  }

  return (
    <>
      {mismatchNotifications.length > 0 && (
        <div className="mt-4 space-y-3 rounded-2xl border border-warning/30 bg-warning/5 p-5">
          <p className="text-sm font-medium text-text-primary">Session time conflicts with your availability</p>
          {mismatchNotifications.map((notification) => (
            <p key={notification.id} className="text-xs text-text-secondary">
              {notification.body}
            </p>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => {
                setAutoOpen(true);
                document.getElementById("schedule-section")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-text-inverse transition-all hover:brightness-110"
            >
              Update my availability
            </button>
            <button
              onClick={handleRePair}
              disabled={repairing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-secondary transition-all hover:bg-bg-hover disabled:opacity-50"
            >
              {repairing ? (
                <>
                  <Loader2 className="size-3 animate-spin" /> Finding...
                </>
              ) : (
                <>
                  <ArrowRight className="size-3" /> Find a new teacher
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div id="schedule-section">
        <RescheduleAvailabilityButton
          mentorshipId={mentorshipId}
          teacherAvail={teacherAvail}
          autoOpen={autoOpen}
        />
      </div>
    </>
  );
}
