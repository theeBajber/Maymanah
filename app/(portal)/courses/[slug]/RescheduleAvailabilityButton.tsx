"use client";

import { Check, Clock, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import {
  AvailabilityGrid,
  slotsToWindows,
  windowsToSlots,
  type GridWindow,
  type SlotKey,
} from "@/app/ui/AvailabilityGrid";
import { Skeleton } from "@/app/ui/Skeleton";
import { useToast } from "@/app/ui/toast";

/**
 * Changes a paired student's weekly schedule from inside a modal.
 *
 * Only the times the teacher keeps open are selectable, and the new schedule is
 * saved against the existing pairing, so a change of hours never becomes a
 * change of teacher. The modal starts from the student's saved hours rather
 * than a blank grid, because saving a blank slate would wipe them.
 */
export function RescheduleAvailabilityButton({
  mentorshipId,
  teacherAvail,
  openRequest = 0,
}: {
  mentorshipId: string;
  teacherAvail: GridWindow[];
  /** Increment to ask the modal to open; each new value opens it again. */
  openRequest?: number;
}) {
  const [open, setOpen] = useState(false);
  const [handledRequest, setHandledRequest] = useState(0);

  // Opening on request is derived rather than synced in an effect, so the modal
  // opens in the same render the request arrives. A counter lets the notice ask
  // again after the student closes the dialog.
  if (openRequest > handledRequest) {
    setHandledRequest(openRequest);
    setOpen(true);
  }

  return (
    <>
      <div className="mt-4 border-t border-border pt-4">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Clock className="size-3" />
          Change my weekly schedule
        </button>
      </div>

      {open ? (
        <ScheduleDialog
          mentorshipId={mentorshipId}
          teacherAvail={teacherAvail}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function ScheduleDialog({
  mentorshipId,
  teacherAvail,
  onClose,
}: {
  mentorshipId: string;
  teacherAvail: GridWindow[];
  onClose: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<Set<SlotKey>>(new Set());
  const [prefilling, setPrefilling] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/availability")
      .then((response) => response.json())
      .then((data: { slots?: GridWindow[] }) => {
        if (!cancelled) setSelected(windowsToSlots(data.slots ?? [], teacherAvail));
      })
      .catch(() => {
        // A failed prefill still leaves a usable grid; a save failure is
        // reported by its own toast.
      })
      .finally(() => {
        if (!cancelled) setPrefilling(false);
      });

    return () => {
      cancelled = true;
    };
  }, [teacherAvail]);

  useEffect(() => {
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSave() {
    if (selected.size === 0) {
      toast({ title: "Select at least one time slot.", variant: "warning" });
      return;
    }

    setSaving(true);
    // Every contiguous run of painted cells becomes one window, matching what
    // the teacher's stored availability looks like.
    const slots = slotsToWindows(selected);

    try {
      const res = await fetch(`/api/mentorship/${mentorshipId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1500);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast({ title: data.error || "Failed to update schedule. Try again.", variant: "error" });
        setSaving(false);
      }
    } catch {
      toast({ title: "Something went wrong. Try again.", variant: "error" });
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          if (!saving) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl border border-border bg-bg-elevated p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 id={titleId} className="text-lg font-bold text-text-primary">
            Change Weekly Schedule
          </h3>
          <button
            ref={closeRef}
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-xl text-text-muted transition-all hover:bg-bg-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        {success ? (
          <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-success/10">
              <Check className="size-6 text-success" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-text-primary">Schedule updated!</h3>
            <p className="text-sm text-text-secondary">Your new schedule is being applied...</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-text-secondary">
              Select <strong>ALL</strong> the times you&apos;re available — the system will create
              daily sessions within your teacher&apos;s available windows. Only slots your teacher
              is available are shown.
            </p>

            {prefilling ? (
              // Holding the grid back until the saved hours arrive means a
              // first click cannot be overwritten by the prefill.
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : (
              <AvailabilityGrid
                selected={selected}
                onSelectedChange={setSelected}
                enabledWindows={teacherAvail}
              />
            )}

            <p className="text-xs text-text-secondary">
              Drag to select multiple slots, or drag over a selected block to clear it. Only times
              your teacher is available are shown.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <p className="text-[11px] text-text-secondary">
                {prefilling
                  ? "Loading your current hours…"
                  : `${selected.size} slot${selected.size !== 1 ? "s" : ""} selected`}
              </p>
              <button
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition-all hover:bg-bg-hover"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || prefilling}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-text-inverse transition-all hover:brightness-110 disabled:opacity-50"
              >
                {saving || prefilling ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    {prefilling ? "Loading…" : "Saving..."}
                  </>
                ) : (
                  "Save Schedule"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
