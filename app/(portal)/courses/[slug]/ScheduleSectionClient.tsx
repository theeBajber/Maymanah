"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/components/ui/toast";
import { RescheduleAvailabilityButton } from "./RescheduleAvailabilityButton";

export function ScheduleSectionClient({
  mentorshipId,
  teacherAvail,
  mismatchNotifications,
}: {
  mentorshipId: string;
  teacherAvail: { dayOfWeek: number; startTime: string; endTime: string }[];
  mismatchNotifications: { id: string; body: string | null; metadata: unknown }[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [autoOpen, setAutoOpen] = useState(false);
  const [repairing, setRepairing] = useState(false);

  async function handleRePair() {
    setRepairing(true);
    try {
      const res = await fetch(`/api/mentorship/${mentorshipId}/re-pair`, {
        method: "POST",
      });
      if (res.ok) {
        // Mark notifications as read
        for (const n of mismatchNotifications) {
          await fetch("/api/notifications/read", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [n.id] }),
          }).catch(() => {});
        }
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
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5 space-y-3">
          <p className="text-sm text-text-primary font-medium">
            Session time conflicts with your availability
          </p>
          {mismatchNotifications.map((n) => (
            <p key={n.id} className="text-xs text-text-secondary">
              {n.body}
            </p>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => {
                setAutoOpen(true);
                // Scroll down to the change schedule button
                setTimeout(() => {
                  document
                    .getElementById("schedule-section")
                    ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 100);
              }}
              className="text-xs font-semibold bg-primary text-text-inverse px-4 py-2 rounded-lg hover:brightness-110 transition-all"
            >
              Update my availability
            </button>
            <button
              onClick={handleRePair}
              disabled={repairing}
              className="text-xs font-semibold border border-border text-text-secondary px-4 py-2 rounded-lg hover:bg-bg-hover transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {repairing ? (
                <><FontAwesomeIcon icon={faSpinner} className="size-3 animate-spin" /> Finding...</>
              ) : (
                <><FontAwesomeIcon icon={faArrowRight} className="size-3" /> Find a new teacher</>
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
